/* =========================================================
   مدیریت مراکز و گزارش کار
   نسخه Supabase
========================================================= */


/* =========================================================
   تنظیمات
========================================================= */

const SUPABASE_URL =
    "https://nqfykfoxdcfgocfvcwxv.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_oLvZjzdOpAdErVP1sjPtzw_X5CGceRk";

const PASSWORD =
    "0111";

const MAX_ATTEMPTS =
    3;

const LOCK_TIME =
    30 * 60 * 1000;


/* =========================================================
   اتصال Supabase
========================================================= */

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


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

    [
        "chahar-mahaal-bakhtiari",
        "چهارمحال و بختیاری"
    ],

    [
        "khorasan-south",
        "خراسان جنوبی"
    ],

    [
        "khorasan-razavi",
        "خراسان رضوی"
    ],

    [
        "khorasan-north",
        "خراسان شمالی"
    ],

    ["khuzestan", "خوزستان"],

    ["zanjan", "زنجان"],

    ["semnan", "سمنان"],

    [
        "sistan-baluchestan",
        "سیستان و بلوچستان"
    ],

    ["fars", "فارس"],

    ["qazvin", "قزوین"],

    ["qom", "قم"],

    ["kurdistan", "کردستان"],

    ["kerman", "کرمان"],

    ["kermanshah", "کرمانشاه"],

    [
        "kohgiluyeh-boyer-ahmad",
        "کهگیلویه و بویراحمد"
    ],

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
   وضعیت برنامه
========================================================= */

let database = {

    centers: []

};

let currentProvince =
    "";

let currentCenter =
    null;


/*
   نمایش همه سوابق یا فقط آخرین
*/

let showAllHistory =
    false;


/* =========================================================
   توابع کمکی DOM
========================================================= */

function getElement(id) {

    return document.getElementById(id);

}


function setValue(id, value) {

    const element =
        getElement(id);

    if (element) {

        element.value =
            value ?? "";

    }

}


function getValue(id) {

    const element =
        getElement(id);

    if (!element) {

        return "";

    }

    return (
        element.value ||
        ""
    ).trim();

}


/* =========================================================
   تاریخ امروز
========================================================= */

function getTodayPersian() {

    return new Intl.DateTimeFormat(
        "fa-IR-u-ca-persian",
        {
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        }
    ).format(
        new Date()
    );

}


/* =========================================================
   تنظیم تاریخ‌های پیش‌فرض
========================================================= */

function setDefaultDates() {

    const today =
        getTodayPersian();


    const visitDate =
        getElement(
            "visitDate"
        );


    if (
        visitDate &&
        !visitDate.value
    ) {

        visitDate.value =
            today;

    }


    const problemDate =
        getElement(
            "problemDate"
        );


    if (
        problemDate &&
        !problemDate.value
    ) {

        problemDate.value =
            today;

    }


    const expertDate =
        getElement(
            "expertDate"
        );


    if (
        expertDate &&
        !expertDate.value
    ) {

        expertDate.value =
            today;

    }

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


    if (
        Date.now() <
        lockUntil
    ) {

        showLockMessage();

        return;

    }


    const password =
        getElement(
            "passwordInput"
        )?.value || "";


    if (
        password ===
        PASSWORD
    ) {

        localStorage.removeItem(
            "site_login_attempts"
        );

        localStorage.removeItem(
            "site_lock_until"
        );


        getElement(
            "loginPage"
        )?.classList.add(
            "hidden"
        );


        getElement(
            "app"
        )?.classList.remove(
            "hidden"
        );


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


    if (
        attempts >=
        MAX_ATTEMPTS
    ) {

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


        if (
            getElement(
                "passwordInput"
            )
        ) {

            getElement(
                "passwordInput"
            ).value = "";

        }


        showLockMessage();

        return;

    }


    localStorage.setItem(
        "site_login_attempts",
        String(attempts)
    );


    const remaining =
        MAX_ATTEMPTS -
        attempts;


    const message =
        getElement(
            "loginMessage"
        );


    if (message) {

        message.textContent =
            "رمز اشتباه است. " +
            remaining +
            " فرصت باقی مانده.";

    }


    setValue(
        "passwordInput",
        ""
    );

}


/* =========================================================
   پیام قفل
========================================================= */

function showLockMessage() {

    const lockUntil =
        Number(
            localStorage.getItem(
                "site_lock_until"
            ) || 0
        );


    const diff =
        lockUntil -
        Date.now();


    if (
        diff <= 0
    ) {

        localStorage.removeItem(
            "site_lock_until"
        );

        localStorage.removeItem(
            "site_login_attempts"
        );


        const message =
            getElement(
                "loginMessage"
            );

        if (message) {

            message.textContent =
                "";

        }

        return;

    }


    const minutes =
        Math.ceil(
            diff / 60000
        );


    const message =
        getElement(
            "loginMessage"
        );


    if (message) {

        message.textContent =
            "ورود موقتاً قفل شده است. " +
            minutes +
            " دقیقه دیگر دوباره تلاش کنید.";

    }

}


/* =========================================================
   نمایش استان‌ها
========================================================= */

function renderProvinces() {

    const grid =
        getElement(
            "provinceGrid"
        );


    if (!grid) {

        return;

    }


    grid.innerHTML =
        "";


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
   دریافت دیتابیس از Supabase
========================================================= */

async function loadDatabase() {

    try {

        const result =
            await supabaseClient
                .from("centers")
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending:
                            true
                    }
                );


        if (result.error) {

            console.error(
                "Supabase load error:",
                result.error
            );


            alert(
                "خطا در دریافت اطلاعات از سرور:\n" +
                result.error.message
            );


            return {
                centers: []
            };

        }


        const centers =
            (result.data || [])
                .map(
                    function(row) {

                        return {

                            id:
                                row.id,

                            province:
                                row.province,

                            name:
                                row.name,

                            visits:
                                Array.isArray(
                                    row.visits
                                )
                                    ?
                                    row.visits
                                    :
                                    []

                        };

                    }
                );


        database = {

            centers:
                centers

        };


        return database;


    } catch (error) {

        console.error(
            error
        );


        alert(
            "ارتباط با پایگاه داده برقرار نشد."
        );


        return {
            centers: []
        };

    }

}


/* =========================================================
   ذخیره مرکز در Supabase
========================================================= */

async function saveCenterToSupabase(
    center
) {

    try {

        const result =
            await supabaseClient
                .from("centers")
                .upsert(
                    {

                        id:
                            center.id,

                        province:
                            center.province,

                        name:
                            center.name,

                        visits:
                            center.visits || []

                    },
                    {
                        onConflict:
                            "id"
                    }
                );


        if (result.error) {

            console.error(
                "Supabase save error:",
                result.error
            );


            alert(
                "ذخیره اطلاعات انجام نشد:\n" +
                result.error.message
            );


            return false;

        }


        return true;


    } catch (error) {

        console.error(
            error
        );


        alert(
            "خطا هنگام ذخیره اطلاعات."
        );


        return false;

    }

}


/* =========================================================
   باز کردن استان
========================================================= */

async function openProvince(
    key,
    name
) {

    currentProvince =
        key;


    currentCenter =
        null;


    showAllHistory =
        false;


    /*
       اطلاعات جدید از سرور
    */

    await loadDatabase();


    getElement(
        "provincePage"
    )?.classList.add(
        "hidden"
    );


    getElement(
        "reportPage"
    )?.classList.add(
        "hidden"
    );


    getElement(
        "centersPage"
    )?.classList.remove(
        "hidden"
    );


    const title =
        getElement(
            "provinceTitle"
        );


    if (title) {

        title.textContent =
            "مراکز " +
            name;

    }


    setValue(
        "centerSearch",
        ""
    );


    renderCenters();

}


/* =========================================================
   نمایش مراکز
========================================================= */

function renderCenters() {

    const grid =
        getElement(
            "centersGrid"
        );


    const empty =
        getElement(
            "emptyCenters"
        );


    if (!grid) {

        return;

    }


    const search =
        getElement(
            "centerSearch"
        );


    const query =
        search
            ?
            search.value
                .trim()
                .toLowerCase()
            :
            "";


    grid.innerHTML =
        "";


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
                        center.name ||
                        ""
                    )
                        .toLowerCase()
                        .includes(
                            query
                        );

                }
            );

    }


    if (!centers.length) {

        if (empty) {

            empty.classList.remove(
                "hidden"
            );

            empty.textContent =
                query
                    ?
                    "مرکزی با این نام پیدا نشد."
                    :
                    "هنوز مرکزی برای این استان ثبت نشده است.";

        }

        return;

    }


    if (empty) {

        empty.classList.add(
            "hidden"
        );

    }


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


            const count =
                document.createElement(
                    "p"
                );


            const visits =
                center.visits || [];


            count.textContent =
                visits.length
                    ?
                    "تعداد مراجعات: " +
                    visits.length
                    :
                    "هنوز گزارشی ثبت نشده";


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
                count
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

    currentCenter =
        null;


    showAllHistory =
        false;


    getElement(
        "centersPage"
    )?.classList.add(
        "hidden"
    );


    getElement(
        "reportPage"
    )?.classList.remove(
        "hidden"
    );


    const title =
        getElement(
            "reportPageTitle"
        );


    if (title) {

        title.textContent =
            "ثبت مرکز جدید";

    }


    const nameInput =
        getElement(
            "centerName"
        );


    if (nameInput) {

        nameInput.removeAttribute(
            "readonly"
        );

    }


    /*
       مرکز جدید:
       اطلاعات مراجعه خالی
    */

    clearVisitFields();


    setValue(
        "centerName",
        ""
    );


    setValue(
        "expertName",
        "حیدریانی"
    );


    setValue(
        "signatureExpertName",
        "حیدریانی"
    );


    renderHistory();

}


/* =========================================================
   باز کردن مرکز موجود
========================================================= */

async function openExistingCenter(
    center
) {

    /*
       اول اطلاعات تازه را از سرور می‌گیریم
    */

    await loadDatabase();


    const freshCenter =
        database.centers.find(
            function(item) {

                return String(
                    item.id
                ) ===
                String(
                    center.id
                );

            }
        );


    currentCenter =
        freshCenter ||
        center;


    showAllHistory =
        false;


    getElement(
        "centersPage"
    )?.classList.add(
        "hidden"
    );


    getElement(
        "reportPage"
    )?.classList.remove(
        "hidden"
    );


    const title =
        getElement(
            "reportPageTitle"
        );


    if (title) {

        title.textContent =
            currentCenter.name;

    }


    const nameInput =
        getElement(
            "centerName"
        );


    if (nameInput) {

        nameInput.value =
            currentCenter.name;

        nameInput.setAttribute(
            "readonly",
            "readonly"
        );

    }


    /*
       اطلاعات مراجعه قبلی پاک می‌شود
       چون قرار است مراجعه جدید ثبت شود.
    */

    clearVisitFields();


    /*
       نام مرکز ثابت است
    */

    setValue(
        "centerName",
        currentCenter.name
    );


    /*
       اگر بخش جزو اطلاعات ثابت مرکز
       در آینده ذخیره شود، اینجا قابل
       پر کردن است.
    */


    setValue(
        "expertName",
        "حیدریانی"
    );


    setValue(
        "signatureExpertName",
        "حیدریانی"
    );


    renderHistory();

}


/* =========================================================
   پاک کردن فیلدهای مراجعه
========================================================= */

function clearVisitFields() {

    setValue(
        "sectionName",
        ""
    );


    setValue(
        "visitDate",
        getTodayPersian()
    );


    setValue(
        "deviceModel",
        ""
    );


    resetSerialSelect();


    setValue(
        "newSerialNumber",
        ""
    );


    getElement(
        "newSerialNumber"
    )?.classList.add(
        "hidden"
    );


    setValue(
        "problemSubject",
        ""
    );


    setValue(
        "reportedBy",
        ""
    );


    setValue(
        "problemDate",
        getTodayPersian()
    );


    setValue(
        "description",
        ""
    );


    setValue(
        "expertName",
        "حیدریانی"
    );


    setValue(
        "expertDate",
        getTodayPersian()
    );


    setValue(
        "entryTime",
        ""
    );


    setValue(
        "exitTime",
        ""
    );


    setValue(
        "receiverName",
        ""
    );


    setValue(
        "signatureExpertName",
        "حیدریانی"
    );

}


/* =========================================================
   سریال‌ها
========================================================= */

function resetSerialSelect() {

    const select =
        getElement(
            "serialNumber"
        );


    if (!select) {

        return;

    }


    select.innerHTML =
        "";


    const option =
        document.createElement(
            "option"
        );


    option.value =
        "";


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
        getValue(
            "deviceModel"
        );


    const select =
        getElement(
            "serialNumber"
        );


    if (!select) {

        return;

    }


    select.innerHTML =
        "";


    if (!model) {

        resetSerialSelect();

        return;

    }


    const first =
        document.createElement(
            "option"
        );


    first.value =
        "";


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
   گرفتن سریال‌های قبلی
========================================================= */

function getCenterSerials(
    model
) {

    if (!currentCenter) {

        return [];

    }


    const visits =
        currentCenter.visits || [];


    const result =
        [];


    visits.forEach(
        function(visit) {

            if (
                visit.deviceModel ===
                model
                &&
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
        getElement(
            "newSerialNumber"
        );


    if (!input) {

        return;

    }


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
   سریال نهایی
========================================================= */

function getSelectedSerial() {

    const newInput =
        getElement(
            "newSerialNumber"
        );


    if (
        newInput
        &&
        !newInput.classList.contains(
            "hidden"
        )
        &&
        newInput.value.trim()
    ) {

        return newInput.value.trim();

    }


    return getValue(
        "serialNumber"
    );

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

        section:
            getValue(
                "sectionName"
            ),

        date:
            getValue(
                "visitDate"
            ),

        deviceModel:
            getValue(
                "deviceModel"
            ),

        serialNumber:
            getSelectedSerial(),

        problemSubject:
            getValue(
                "problemSubject"
            ),

        reportedBy:
            getValue(
                "reportedBy"
            ),

        problemDate:
            getValue(
                "problemDate"
            ),

        description:
            getValue(
                "description"
            ),

        expertName:
            getValue(
                "expertName"
            ),

        expertDate:
            getValue(
                "expertDate"
            ),

        entryTime:
            getValue(
                "entryTime"
            ),

        exitTime:
            getValue(
                "exitTime"
            ),

        receiverName:
            getValue(
                "receiverName"
            ),

        signatureExpertName:
            getValue(
                "signatureExpertName"
            )

    };

}


/* =========================================================
   ذخیره گزارش
========================================================= */

async function saveVisit() {

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
       اگر مرکز هنوز ساخته نشده،
       اول از سرور بررسی می‌کنیم.
    */

    if (!currentCenter) {

        await loadDatabase();


        currentCenter =
            database.centers.find(
                function(center) {

                    return (

                        center.province ===
                        currentProvince

                        &&

                        String(
                            center.name
                        )
                            .trim()
                            .toLowerCase() ===

                        String(
                            data.centerName
                        )
                            .trim()
                            .toLowerCase()

                    );

                }
            );


        /*
           اگر وجود نداشت، مرکز جدید
        */

        if (!currentCenter) {

            currentCenter = {

                id:
                    Date.now(),

                province:
                    currentProvince,

                name:
                    data.centerName,

                visits:
                    []

            };


            database.centers.push(
                currentCenter
            );

        }

    }


    /*
       مرکز
    */

    currentCenter.name =
        data.centerName;


    currentCenter.province =
        currentProvince;


    if (
        !Array.isArray(
            currentCenter.visits
        )
    ) {

        currentCenter.visits =
            [];

    }


    /*
       گزارش
    */

    const visit = {

        id:
            Date.now(),

        savedAt:
            new Date().toISOString(),

        ...data

    };


    /*
       گزارش جدید اول لیست
    */

    currentCenter.visits.unshift(
        visit
    );


    /*
       ذخیره روی سرور
    */

    const saved =
        await saveCenterToSupabase(
            currentCenter
        );


    if (!saved) {

        /*
           اگر ذخیره نشد، گزارش محلی
           را برمی‌گردانیم تا اشتباهی
           داخل صفحه باقی نماند.
        */

        currentCenter.visits.shift();

        return;

    }


    /*
       اطلاعات تازه را دوباره می‌گیریم
    */

    const centerId =
        currentCenter.id;


    await loadDatabase();


    currentCenter =
        database.centers.find(
            function(center) {

                return String(
                    center.id
                ) ===
                String(
                    centerId
                );

            }
        );


    /*
       صفحه
    */

    const title =
        getElement(
            "reportPageTitle"
        );


    if (title) {

        title.textContent =
            currentCenter.name;

    }


    const nameInput =
        getElement(
            "centerName"
        );


    if (nameInput) {

        nameInput.value =
            currentCenter.name;

        nameInput.setAttribute(
            "readonly",
            "readonly"
        );

    }


    /*
       سریال‌ها
    */

    loadSerialNumbers();


    /*
       تاریخچه
    */

    showAllHistory =
        false;


    renderHistory();


    alert(
        "گزارش با موفقیت در سرور ذخیره شد."
    );

}


/* =========================================================
   ساخت تاریخچه
   فقط آخرین مراجعه
========================================================= */

function renderHistory() {

    const history =
        getElement(
            "history"
        );


    if (!history) {

        return;

    }


    history.innerHTML =
        "";


    if (!currentCenter) {

        history.innerHTML =
            "<p class='empty-message'>هنوز گزارشی ثبت نشده است.</p>";

        return;

    }


    const visits =
        currentCenter.visits || [];


    if (!visits.length) {

        history.innerHTML =
            "<p class='empty-message'>هنوز گزارشی برای این مرکز ثبت نشده است.</p>";

        return;

    }


    /*
       فقط آخرین یا همه
    */

    const visibleVisits =
        showAllHistory
            ?
            visits
            :
            visits.slice(
                0,
                1
            );


    visibleVisits.forEach(
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
                showAllHistory
                    ?
                    "گزارش " +
                    (index + 1) +
                    " — " +
                    (
                        visit.date ||
                        "بدون تاریخ"
                    )
                    :
                    "آخرین مراجعه — " +
                    (
                        visit.date ||
                        "بدون تاریخ"
                    );


            box.appendChild(
                title
            );


            const info =
                document.createElement(
                    "p"
                );


            info.textContent =
                "دستگاه: " +
                (
                    visit.deviceModel ||
                    "-"
                ) +
                " | سریال: " +
                (
                    visit.serialNumber ||
                    "-"
                );


            box.appendChild(
                info
            );


            if (
                visit.problemSubject
            ) {

                const subject =
                    document.createElement(
                        "p"
                    );


                subject.textContent =
                    "موضوع مشکل: " +
                    visit.problemSubject;


                box.appendChild(
                    subject
                );

            }


            const description =
                document.createElement(
                    "p"
                );


            description.textContent =
                visit.description
                    ?
                    visit.description
                    :
                    "توضیحی ثبت نشده است.";


            box.appendChild(
                description
            );


            history.appendChild(
                box
            );

        }
    );


    /*
       دکمه بیشتر
    */

    if (
        visits.length > 1
    ) {

        const moreButton =
            document.createElement(
                "button"
            );


        moreButton.type =
            "button";


        moreButton.className =
            "btn btn-gray";


        moreButton.style.marginTop =
            "10px";


        moreButton.textContent =
            showAllHistory
                ?
                "بستن سوابق"
                :
                "بیشتر";


        moreButton.addEventListener(
            "click",
            function() {

                showAllHistory =
                    !showAllHistory;


                renderHistory();

            }
        );


        history.appendChild(
            moreButton
        );

    }

}


/* =========================================================
   متن ثابت توضیحات
========================================================= */

function makeDescription(
    description
) {

    const middle =
        description
            ?
            "\n" +
            description +
            "\n"
            :
            "\n";


    return (

        "با مراجعه به مرکز و بررسی ربات،" +

        middle +

        "ربات تست و تحویل مسئول مربوطه گردید."

    );

}


/* =========================================================
   گزارش PDF
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


    const province =
        provinces.find(
            function(item) {

                return (
                    item[0] ===
                    currentProvince
                );

            }
        );


    const provinceName =
        province
            ?
            province[1]
            :
            "";


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

<html
    lang="fa"
    dir="rtl"
>

<head>

<meta charset="UTF-8">

<title>
گزارش کار - ${escapeHTML(
        data.centerName
    )}
</title>

<style>

@page {

    size:
        A4;

    margin:
        15mm;

}


* {

    box-sizing:
        border-box;

}


body {

    margin:
        0;

    padding:
        0;

    font-family:
        Tahoma,
        Arial,
        sans-serif;

    direction:
        rtl;

    color:
        #111;

    font-size:
        13px;

}


h1 {

    text-align:
        center;

    margin:
        0 0 20px 0;

    font-size:
        22px;

}


.row {

    display:
        grid;

    gap:
        8px;

    margin-bottom:
        10px;

}


.row-3 {

    grid-template-columns:
        repeat(
            3,
            1fr
        );

}


.row-2 {

    grid-template-columns:
        repeat(
            2,
            1fr
        );

}


.row-4 {

    grid-template-columns:
        repeat(
            4,
            1fr
        );

}


.field {

    border:
        1px solid #333;

    min-height:
        48px;

}


.label {

    background:
        #eeeeee;

    border-bottom:
        1px solid #333;

    padding:
        7px;

    font-weight:
        bold;

}


.value {

    padding:
        9px;

    min-height:
        28px;

}


.description-section {

    border:
        1px solid #333;

    margin-top:
        10px;

    margin-bottom:
        18px;

}


.description-title {

    background:
        #eeeeee;

    border-bottom:
        1px solid #333;

    padding:
        9px;

    font-weight:
        bold;

}


.description-text {

    white-space:
        pre-wrap;

    line-height:
        2;

    min-height:
        180px;

    padding:
        15px;

}


.signatures {

    display:
        flex;

    justify-content:
        space-between;

    margin-top:
        70px;

}


.signature {

    width:
        40%;

    text-align:
        center;

}


.signature-line {

    margin-top:
        45px;

    border-bottom:
        1px solid #111;

}


@media print {

    body {

        print-color-adjust:
            exact;

        -webkit-print-color-adjust:
            exact;

    }

}


</style>

</head>

<body>


<h1>
گزارش کار
</h1>


<!-- =====================
     ردیف اول
====================== -->

<div class="row row-3">


    <div class="field">

        <div class="label">
            نام مرکز
        </div>

        <div class="value">
            ${escapeHTML(
                data.centerName
            )}
        </div>

    </div>


    <div class="field">

        <div class="label">
            بخش
        </div>

        <div class="value">
            ${escapeHTML(
                data.section
            )}
        </div>

    </div>


    <div class="field">

        <div class="label">
            تاریخ
        </div>

        <div class="value">
            ${escapeHTML(
                data.date
            )}
        </div>

    </div>


</div>


<!-- =====================
     مدل و سریال
====================== -->

<div class="row row-2">


    <div class="field">

        <div class="label">
            مدل دستگاه
        </div>

        <div class="value">
            ${escapeHTML(
                data.deviceModel
            )}
        </div>

    </div>


    <div class="field">

        <div class="label">
            شماره سریال دستگاه
        </div>

        <div class="value">
            ${escapeHTML(
                data.serialNumber
            )}
        </div>

    </div>


</div>


<!-- =====================
     موضوع مشکل
====================== -->

<div class="row row-3">


    <div class="field">

        <div class="label">
            موضوع مشکل
        </div>

        <div class="value">
            ${escapeHTML(
                data.problemSubject
            )}
        </div>

    </div>


    <div class="field">

        <div class="label">
            گزارش شده توسط
        </div>

        <div class="value">
            ${escapeHTML(
                data.reportedBy
            )}
        </div>

    </div>


    <div class="field">

        <div class="label">
            تاریخ اعلام مشکل
        </div>

        <div class="value">
            ${escapeHTML(
                data.problemDate
            )}
        </div>

    </div>


</div>


<!-- =====================
     توضیحات
====================== -->

<div class="description-section">


    <div class="description-title">
        توضیحات
    </div>


    <div class="description-text">
${escapeHTML(
    description
)}
    </div>


</div>


<!-- =====================
     اطلاعات کارشناس
====================== -->

<div class="row row-4">


    <div class="field">

        <div class="label">
            نام کارشناس
        </div>

        <div class="value">
            ${escapeHTML(
                data.expertName
            )}
        </div>

    </div>


    <div class="field">

        <div class="label">
            تاریخ
        </div>

        <div class="value">
            ${escapeHTML(
                data.expertDate
            )}
        </div>

    </div>


    <div class="field">

        <div class="label">
            ساعت ورود
        </div>

        <div class="value">
            ${escapeHTML(
                data.entryTime
            )}
        </div>

    </div>


    <div class="field">

        <div class="label">
            ساعت خروج
        </div>

        <div class="value">
            ${escapeHTML(
                data.exitTime
            )}
        </div>

    </div>


</div>


<!-- =====================
     امضاها
====================== -->

<div class="signatures">


    <div class="signature">

        <strong>
            نام و امضا تحویل گیرنده
        </strong>

        <div>
            ${escapeHTML(
                data.receiverName
            )}
        </div>

        <div class="signature-line"></div>

    </div>


    <div class="signature">

        <strong>
            نام و امضا کارشناس
        </strong>

        <div>
            ${escapeHTML(
                data.signatureExpertName
            )}
        </div>

        <div class="signature-line"></div>

    </div>


</div>


<script>

setTimeout(
    function() {

        window.print();

    },
    500
);

<\/script>


</body>

</html>

    `);


    report.document.close();

}


/* =========================================================
   امنیت HTML
========================================================= */

function escapeHTML(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(
        value
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


/* =========================================================
   اتصال رویدادها
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function() {


        /*
           ورود
        */

        const loginBtn =
            getElement(
                "loginBtn"
            );


        if (loginBtn) {

            loginBtn.addEventListener(
                "click",
                checkLogin
            );

        }


        const passwordInput =
            getElement(
                "passwordInput"
            );


        if (passwordInput) {

            passwordInput.addEventListener(
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

        }


        /*
           اگر سایت در حالت قفل باشد
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


        /*
           برگشت به استان‌ها
        */

        const backProvinceBtn =
            getElement(
                "backProvinceBtn"
            );


        if (backProvinceBtn) {

            backProvinceBtn.addEventListener(
                "click",
                function() {

                    getElement(
                        "centersPage"
                    )?.classList.add(
                        "hidden"
                    );


                    getElement(
                        "provincePage"
                    )?.classList.remove(
                        "hidden"
                    );


                    currentCenter =
                        null;


                    loadDatabase();

                }
            );

        }


        /*
           مرکز جدید
        */

        const newCenterBtn =
            getElement(
                "newCenterBtn"
            );


        if (newCenterBtn) {

            newCenterBtn.addEventListener(
                "click",
                createNewCenter
            );

        }


        /*
           برگشت از گزارش
        */

        const backCentersBtn =
            getElement(
                "backCentersBtn"
            );


        if (backCentersBtn) {

            backCentersBtn.addEventListener(
                "click",
                function() {

                    getElement(
                        "reportPage"
                    )?.classList.add(
                        "hidden"
                    );


                    getElement(
                        "centersPage"
                    )?.classList.remove(
                        "hidden"
                    );


                    currentCenter =
                        null;


                    renderCenters();

                }
            );

        }


        /*
           جستجو
        */

        const centerSearch =
            getElement(
                "centerSearch"
            );


        if (centerSearch) {

            centerSearch.addEventListener(
                "input",
                renderCenters
            );

        }


        /*
           تغییر مدل دستگاه
        */

        const deviceModel =
            getElement(
                "deviceModel"
            );


        if (deviceModel) {

            deviceModel.addEventListener(
                "change",
                loadSerialNumbers
            );

        }


        /*
           سریال جدید
        */

        const newSerialBtn =
            getElement(
                "newSerialBtn"
            );


        if (newSerialBtn) {

            newSerialBtn.addEventListener(
                "click",
                toggleNewSerial
            );

        }


        /*
           ذخیره
        */

        const saveVisitBtn =
            getElement(
                "saveVisitBtn"
            );


        if (saveVisitBtn) {

            saveVisitBtn.addEventListener(
                "click",
                saveVisit
            );

        }


        /*
           چاپ
        */

        const printReportBtn =
            getElement(
                "printReportBtn"
            );


        if (printReportBtn) {

            printReportBtn.addEventListener(
                "click",
                printReport
            );

        }


        /*
           تاریخ پیش‌فرض
        */

        setDefaultDates();


        /*
           دیتابیس را از سرور بخوان
        */

        await loadDatabase();

    }
);
