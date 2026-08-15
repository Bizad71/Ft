/* =========================================================
   مدیریت مراکز و گزارش کار
   نسخه هماهنگ با ساختار واقعی Supabase
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
   Supabase
========================================================= */

let supabaseClient = null;


/* =========================================================
   استان‌ها
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
   وضعیت برنامه
========================================================= */

let database = {
    centers: []
};

let currentProvince = "";
let currentCenter = null;
let currentDevices = [];
let currentVisits = [];
let showAllHistory = false;


/* =========================================================
   ابزار DOM
========================================================= */

function getElement(id) {

    return document.getElementById(id);

}


function setValue(id, value) {

    const element = getElement(id);

    if (element) {
        element.value = value ?? "";
    }

}


function getValue(id) {

    const element = getElement(id);

    if (!element) {
        return "";
    }

    return String(
        element.value || ""
    ).trim();

}


/* =========================================================
   تاریخ
========================================================= */

function getTodayISO() {

    const now = new Date();

    const year =
        now.getFullYear();

    const month =
        String(
            now.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            now.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;

}


function setDefaultDates() {

    const today =
        getTodayISO();

    [
        "visitDate",
        "problemDate",
        "expertDate"
    ].forEach(function(id) {

        const element =
            getElement(id);

        if (
            element &&
            !element.value
        ) {
            element.value = today;
        }

    });

}


/* =========================================================
   Supabase
========================================================= */

function initSupabase() {

    if (
        !window.supabase ||
        typeof window.supabase.createClient !== "function"
    ) {

        console.error(
            "Supabase library is not loaded."
        );

        return false;
    }

    supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY
        );

    return true;
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
        getValue("passwordInput");


    if (password === PASSWORD) {

        localStorage.removeItem(
            "site_login_attempts"
        );

        localStorage.removeItem(
            "site_lock_until"
        );


        getElement(
            "loginPage"
        )?.classList.add("hidden");


        getElement(
            "app"
        )?.classList.remove("hidden");


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

        setValue(
            "passwordInput",
            ""
        );

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
        getElement("loginMessage");


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


    if (diff <= 0) {

        localStorage.removeItem(
            "site_lock_until"
        );

        localStorage.removeItem(
            "site_login_attempts"
        );

        const message =
            getElement("loginMessage");

        if (message) {
            message.textContent = "";
        }

        return;
    }


    const minutes =
        Math.ceil(
            diff / 60000
        );


    const message =
        getElement("loginMessage");


    if (message) {

        message.textContent =
            "ورود موقتاً قفل شده است. " +
            minutes +
            " دقیقه دیگر دوباره تلاش کنید.";

    }
}


/* =========================================================
   استان‌ها
========================================================= */

function renderProvinces() {

    const grid =
        getElement("provinceGrid");

    if (!grid) {
        return;
    }

    grid.innerHTML = "";


    provinces.forEach(function(province) {

        const button =
            document.createElement("button");

        button.type = "button";

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


        grid.appendChild(button);

    });
}


/* =========================================================
   دریافت مراکز
========================================================= */

async function loadCenters() {

    if (!supabaseClient) {

        if (!initSupabase()) {

            throw new Error(
                "کتابخانه Supabase بارگذاری نشده است."
            );

        }
    }


    const result =
        await supabaseClient
            .from("centers")
            .select(
                "id, province, name, section, phone, manager, created_at"
            )
            .order(
                "created_at",
                {
                    ascending: true
                }
            );


    if (result.error) {

        console.error(
            "CENTERS ERROR:",
            result.error
        );

        throw result.error;
    }


    database.centers =
        result.data || [];


    return database.centers;
}


/* =========================================================
   دریافت دستگاه‌ها و گزارش‌های یک مرکز
========================================================= */

async function loadCenterDetails(centerId) {

    if (!supabaseClient) {
        initSupabase();
    }


    const devicesResult =
        await supabaseClient
            .from("devices")
            .select(
                "id, center_id, model, serial, created_at"
            )
            .eq(
                "center_id",
                centerId
            )
            .order(
                "created_at",
                {
                    ascending: true
                }
            );


    if (devicesResult.error) {

        console.error(
            "DEVICES ERROR:",
            devicesResult.error
        );

        throw devicesResult.error;
    }


    const visitsResult =
        await supabaseClient
            .from("visits")
            .select(
                "id, center_id, device_id, visit_date, problem_subject, reported_by, problem_date, description, expert_name, entry_time, exit_time, receiver_name, expert_signature, created_at"
            )
            .eq(
                "center_id",
                centerId
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (visitsResult.error) {

        console.error(
            "VISITS ERROR:",
            visitsResult.error
        );

        throw visitsResult.error;
    }


    currentDevices =
        devicesResult.data || [];

    currentVisits =
        visitsResult.data || [];


    return {
        devices: currentDevices,
        visits: currentVisits
    };
}


/* =========================================================
   خطای دیتابیس
========================================================= */

function showDatabaseError(error) {

    console.error(error);


    let message =
        "خطا در ارتباط با پایگاه داده.";

    if (error?.message) {

        message +=
            "\n\n" +
            error.message;

    }


    if (error?.details) {

        message +=
            "\n" +
            error.details;

    }


    alert(message);
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

    currentDevices =
        [];

    currentVisits =
        [];

    showAllHistory =
        false;


    try {

        await loadCenters();

    } catch (error) {

        showDatabaseError(error);

        return;
    }


    getElement(
        "provincePage"
    )?.classList.add("hidden");


    getElement(
        "reportPage"
    )?.classList.add("hidden");


    getElement(
        "centersPage"
    )?.classList.remove("hidden");


    setValue(
        "centerSearch",
        ""
    );


    const title =
        getElement("provinceTitle");


    if (title) {

        title.textContent =
            "مراکز " + name;

    }


    renderCenters();
}


/* =========================================================
   نمایش مراکز
========================================================= */

function renderCenters() {

    const grid =
        getElement("centersGrid");

    const empty =
        getElement("emptyCenters");


    if (!grid) {
        return;
    }


    const query =
        getValue(
            "centerSearch"
        ).toLowerCase();


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

                    return String(
                        center.name || ""
                    )
                        .toLowerCase()
                        .includes(query);

                }
            );

    }


    if (!centers.length) {

        empty?.classList.remove("hidden");


        if (empty) {

            empty.textContent =
                query
                    ?
                    "مرکزی با این نام پیدا نشد."
                    :
                    "هنوز مرکزی برای این استان ثبت نشده است.";

        }

        return;
    }


    empty?.classList.add("hidden");


    centers.forEach(function(center) {

        const box =
            document.createElement("div");

        box.className =
            "center-box";


        const title =
            document.createElement("h3");

        title.textContent =
            "🏥 " +
            center.name;


        const info =
            document.createElement("p");

        let infoText = "";


        if (center.section) {

            infoText +=
                "بخش: " +
                center.section;

        }


        if (center.phone) {

            if (infoText) {
                infoText += " | ";
            }

            infoText +=
                "تلفن: " +
                center.phone;

        }


        info.textContent =
            infoText ||
            "اطلاعات تکمیلی ثبت نشده است.";


        const button =
            document.createElement("button");

        button.type =
            "button";

        button.className =
            "btn btn-blue";

        button.textContent =
            "باز کردن مرکز";


        button.addEventListener(
            "click",
            function() {

                openExistingCenter(center);

            }
        );


        box.appendChild(title);

        box.appendChild(info);

        box.appendChild(button);

        grid.appendChild(box);

    });
}


/* =========================================================
   مرکز جدید
========================================================= */

function createNewCenter() {

    currentCenter =
        null;

    currentDevices =
        [];

    currentVisits =
        [];

    showAllHistory =
        false;


    getElement(
        "centersPage"
    )?.classList.add("hidden");


    getElement(
        "reportPage"
    )?.classList.remove("hidden");


    const title =
        getElement("reportPageTitle");


    if (title) {

        title.textContent =
            "ثبت مرکز جدید";

    }


    const nameInput =
        getElement("centerName");


    if (nameInput) {

        nameInput.removeAttribute("readonly");

    }


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
   مرکز موجود
========================================================= */

async function openExistingCenter(center) {

    try {

        await loadCenterDetails(
            center.id
        );

    } catch (error) {

        showDatabaseError(error);

        return;
    }


    currentCenter =
        center;


    showAllHistory =
        false;


    getElement(
        "centersPage"
    )?.classList.add("hidden");


    getElement(
        "reportPage"
    )?.classList.remove("hidden");


    const title =
        getElement("reportPageTitle");


    if (title) {

        title.textContent =
            currentCenter.name;

    }


    const nameInput =
        getElement("centerName");


    if (nameInput) {

        nameInput.value =
            currentCenter.name;

        nameInput.setAttribute(
            "readonly",
            "readonly"
        );

    }


    clearVisitFields();


    setValue(
        "centerName",
        currentCenter.name
    );


    loadSerialNumbers();

    renderHistory();
}


/* =========================================================
   پاک کردن فرم مراجعه
========================================================= */

function clearVisitFields() {

    setValue(
        "sectionName",
        currentCenter?.section || ""
    );


    setValue(
        "visitDate",
        getTodayISO()
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
    )?.classList.add("hidden");


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
        getTodayISO()
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
        getTodayISO()
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
   سریال
========================================================= */

function resetSerialSelect() {

    const select =
        getElement("serialNumber");


    if (!select) {
        return;
    }


    select.innerHTML = "";


    const option =
        document.createElement("option");


    option.value = "";

    option.textContent =
        "ابتدا مدل دستگاه را انتخاب کنید";


    select.appendChild(option);
}


/* =========================================================
   سریال‌های مرکز
========================================================= */

function getCenterSerials(model) {

    return currentDevices
        .filter(function(device) {

            return (
                device.model === model &&
                device.serial
            );

        })
        .map(function(device) {

            return device.serial;

        });
}


/* =========================================================
   بارگذاری سریال‌ها
========================================================= */

function loadSerialNumbers() {

    const model =
        getValue("deviceModel");


    const select =
        getElement("serialNumber");


    if (!select) {
        return;
    }


    select.innerHTML = "";


    if (!model) {

        resetSerialSelect();

        return;
    }


    const first =
        document.createElement("option");


    first.value = "";

    first.textContent =
        "انتخاب شماره سریال";


    select.appendChild(first);


    const serials =
        getCenterSerials(model);


    serials.forEach(function(serial) {

        const option =
            document.createElement("option");

        option.value =
            serial;

        option.textContent =
            serial;

        select.appendChild(option);

    });
}


/* =========================================================
   سریال جدید
========================================================= */

function toggleNewSerial() {

    const input =
        getElement("newSerialNumber");


    if (!input) {
        return;
    }


    input.classList.toggle("hidden");


    if (
        !input.classList.contains("hidden")
    ) {

        input.focus();

    }
}


/* =========================================================
   سریال انتخاب‌شده
========================================================= */

function getSelectedSerial() {

    const newInput =
        getElement("newSerialNumber");


    if (
        newInput &&
        !newInput.classList.contains("hidden") &&
        newInput.value.trim()
    ) {

        return newInput.value.trim();

    }


    return getValue("serialNumber");
}


/* =========================================================
   اطلاعات فرم
========================================================= */

function getFormData() {

    return {

        centerName:
            getValue("centerName"),

        section:
            getValue("sectionName"),

        date:
            getValue("visitDate"),

        deviceModel:
            getValue("deviceModel"),

        serialNumber:
            getSelectedSerial(),

        problemSubject:
            getValue("problemSubject"),

        reportedBy:
            getValue("reportedBy"),

        problemDate:
            getValue("problemDate"),

        description:
            getValue("description"),

        expertName:
            getValue("expertName"),

        expertDate:
            getValue("expertDate"),

        entryTime:
            getValue("entryTime"),

        exitTime:
            getValue("exitTime"),

        receiverName:
            getValue("receiverName"),

        signatureExpertName:
            getValue("signatureExpertName")

    };
}


/* =========================================================
   پیدا کردن / ساخت مرکز
========================================================= */

async function getOrCreateCenter(data) {

    if (!currentCenter) {

        await loadCenters();


        currentCenter =
            database.centers.find(
                function(center) {

                    return (
                        center.province === currentProvince &&
                        String(center.name || "")
                            .trim()
                            .toLowerCase() ===
                        String(data.centerName || "")
                            .trim()
                            .toLowerCase()
                    );

                }
            );


        if (!currentCenter) {

            const result =
                await supabaseClient
                    .from("centers")
                    .insert({

                        province:
                            currentProvince,

                        name:
                            data.centerName,

                        section:
                            data.section || "",

                        phone:
                            "",

                        manager:
                            ""

                    })
                    .select()
                    .single();


            if (result.error) {
                throw result.error;
            }


            currentCenter =
                result.data;

            database.centers.push(
                currentCenter
            );

        }

    }


    return currentCenter;
}


/* =========================================================
   پیدا کردن / ساخت دستگاه
========================================================= */

async function getOrCreateDevice(
    centerId,
    model,
    serial
) {

    let device =
        currentDevices.find(
            function(item) {

                return (
                    item.model === model &&
                    item.serial === serial
                );

            }
        );


    if (device) {
        return device;
    }


    const result =
        await supabaseClient
            .from("devices")
            .insert({

                center_id:
                    centerId,

                model:
                    model,

                serial:
                    serial

            })
            .select()
            .single();


    if (result.error) {
        throw result.error;
    }


    device =
        result.data;


    currentDevices.push(
        device
    );


    return device;
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


    try {

        if (!supabaseClient) {
            initSupabase();
        }


        /* -------------------------
           مرکز
        ------------------------- */

        const center =
            await getOrCreateCenter(data);


        /* -------------------------
           به‌روزرسانی بخش مرکز
        ------------------------- */

        if (
            data.section &&
            data.section !== center.section
        ) {

            const updateResult =
                await supabaseClient
                    .from("centers")
                    .update({

                        section:
                            data.section

                    })
                    .eq(
                        "id",
                        center.id
                    );


            if (updateResult.error) {
                throw updateResult.error;
            }


            center.section =
                data.section;
        }


        /* -------------------------
           دستگاه
        ------------------------- */

        const device =
            await getOrCreateDevice(
                center.id,
                data.deviceModel,
                data.serialNumber
            );


        /* -------------------------
           گزارش
        ------------------------- */

        const visitResult =
            await supabaseClient
                .from("visits")
                .insert({

                    center_id:
                        center.id,

                    device_id:
                        device.id,

                    visit_date:
                        data.date || null,

                    problem_subject:
                        data.problemSubject || "",

                    reported_by:
                        data.reportedBy || "",

                    problem_date:
                        data.problemDate || null,

                    description:
                        data.description || "",

                    expert_name:
                        data.expertName || "",

                    entry_time:
                        data.entryTime || null,

                    exit_time:
                        data.exitTime || null,

                    receiver_name:
                        data.receiverName || "",

                    expert_signature:
                        data.signatureExpertName || ""

                })
                .select()
                .single();


        if (visitResult.error) {
            throw visitResult.error;
        }


        currentVisits.unshift(
            visitResult.data
        );


        loadSerialNumbers();

        showAllHistory =
            false;

        renderHistory();


        alert(
            "گزارش با موفقیت ذخیره شد."
        );


    } catch (error) {

        showDatabaseError(error);

    }
}


/* =========================================================
   تاریخچه
========================================================= */

function renderHistory() {

    const history =
        getElement("history");


    if (!history) {
        return;
    }


    history.innerHTML = "";


    if (!currentCenter) {

        history.innerHTML =
            "<p class='empty-message'>هنوز گزارشی ثبت نشده است.</p>";

        return;
    }


    if (!currentVisits.length) {

        history.innerHTML =
            "<p class='empty-message'>هنوز گزارشی برای این مرکز ثبت نشده است.</p>";

        return;
    }


    const visibleVisits =
        showAllHistory
            ?
            currentVisits
            :
            currentVisits.slice(0, 1);


    visibleVisits.forEach(
        function(visit, index) {

            const device =
                currentDevices.find(
                    function(item) {

                        return String(item.id) ===
                            String(visit.device_id);

                    }
                );


            const box =
                document.createElement("div");

            box.className =
                "history-item";


            const title =
                document.createElement("h3");


            title.textContent =
                showAllHistory
                    ?
                    "گزارش " +
                    (index + 1) +
                    " — " +
                    (
                        visit.visit_date ||
                        "بدون تاریخ"
                    )
                    :
                    "آخرین مراجعه — " +
                    (
                        visit.visit_date ||
                        "بدون تاریخ"
                    );


            box.appendChild(title);


            const info =
                document.createElement("p");


            info.textContent =
                "دستگاه: " +
                (
                    device?.model ||
                    "-"
                ) +
                " | سریال: " +
                (
                    device?.serial ||
                    "-"
                );


            box.appendChild(info);


            if (visit.problem_subject) {

                const subject =
                    document.createElement("p");


                subject.textContent =
                    "موضوع مشکل: " +
                    visit.problem_subject;


                box.appendChild(subject);

            }


            const description =
                document.createElement("p");


            description.textContent =
                visit.description ||
                "توضیحی ثبت نشده است.";


            box.appendChild(description);


            history.appendChild(box);

        }
    );


    if (currentVisits.length > 1) {

        const moreButton =
            document.createElement("button");


        moreButton.type =
            "button";

        moreButton.className =
            "btn btn-gray";


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
   متن توضیحات
========================================================= */

function makeDescription(description) {

    return (
        "با مراجعه به مرکز و بررسی ربات,\n\n" +
        (description || "") +
        "\n\n" +
        "ربات تست و تحویل مسئول مربوطه گردید."
    );
}


/* =========================================================
   چاپ گزارش
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

<title>گزارش کار</title>

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
    font-family: Tahoma, Arial, sans-serif;
    direction: rtl;
    color: #111;
    font-size: 13px;
}

h1 {
    text-align: center;
    margin: 0 0 20px;
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
    padding: 9px;
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

</style>

</head>

<body>

<h1>گزارش کار</h1>

<div class="row row-3">

<div class="field">
<div class="label">نام مرکز</div>
<div class="value">
${escapeHTML(data.centerName)}
</div>
</div>

<div class="field">
<div class="label">بخش</div>
<div class="value">
${escapeHTML(data.section)}
</div>
</div>

<div class="field">
<div class="label">تاریخ</div>
<div class="value">
${escapeHTML(data.date)}
</div>
</div>

</div>

<div class="row row-2">

<div class="field">
<div class="label">مدل دستگاه</div>
<div class="value">
${escapeHTML(data.deviceModel)}
</div>
</div>

<div class="field">
<div class="label">شماره سریال دستگاه</div>
<div class="value">
${escapeHTML(data.serialNumber)}
</div>
</div>

</div>

<div class="row row-3">

<div class="field">
<div class="label">موضوع مشکل</div>
<div class="value">
${escapeHTML(data.problemSubject)}
</div>
</div>

<div class="field">
<div class="label">گزارش شده توسط</div>
<div class="value">
${escapeHTML(data.reportedBy)}
</div>
</div>

<div class="field">
<div class="label">تاریخ اعلام مشکل</div>
<div class="value">
${escapeHTML(data.problemDate)}
</div>
</div>

</div>

<div class="description-section">

<div class="description-title">
توضیحات
</div>

<div class="description-text">
${escapeHTML(description)}
</div>

</div>

<div class="row row-4">

<div class="field">
<div class="label">نام کارشناس</div>
<div class="value">
${escapeHTML(data.expertName)}
</div>
</div>

<div class="field">
<div class="label">تاریخ</div>
<div class="value">
${escapeHTML(data.expertDate)}
</div>
</div>

<div class="field">
<div class="label">ساعت ورود</div>
<div class="value">
${escapeHTML(data.entryTime)}
</div>
</div>

<div class="field">
<div class="label">ساعت خروج</div>
<div class="value">
${escapeHTML(data.exitTime)}
</div>
</div>

</div>

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

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");
}


/* =========================================================
   رویدادها
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        console.log(
            "Site loaded"
        );


        /* Supabase */

        initSupabase();


        /* ورود */

        getElement(
            "loginBtn"
        )?.addEventListener(
            "click",
            checkLogin
        );


        getElement(
            "passwordInput"
        )?.addEventListener(
            "keydown",
            function(event) {

                if (
                    event.key === "Enter"
                ) {

                    checkLogin();

                }

            }
        );


        /* قفل */

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


        /* استان‌ها */

        renderProvinces();


        /* برگشت استان */

        getElement(
            "backProvinceBtn"
        )?.addEventListener(
            "click",
            function() {

                getElement(
                    "centersPage"
                )?.classList.add("hidden");


                getElement(
                    "provincePage"
                )?.classList.remove("hidden");


                currentCenter =
                    null;

                currentDevices =
                    [];

                currentVisits =
                    [];

            }
        );


        /* مرکز جدید */

        getElement(
            "newCenterBtn"
        )?.addEventListener(
            "click",
            createNewCenter
        );


        /* برگشت مراکز */

        getElement(
            "backCentersBtn"
        )?.addEventListener(
            "click",
            function() {

                getElement(
                    "reportPage"
                )?.classList.add("hidden");


                getElement(
                    "centersPage"
                )?.classList.remove("hidden");


                currentCenter =
                    null;


                currentDevices =
                    [];

                currentVisits =
                    [];


                renderCenters();

            }
        );


        /* جستجو */

        getElement(
            "centerSearch"
        )?.addEventListener(
            "input",
            renderCenters
        );


        /* مدل دستگاه */

        getElement(
            "deviceModel"
        )?.addEventListener(
            "change",
            loadSerialNumbers
        );


        /* سریال جدید */

        getElement(
            "newSerialBtn"
        )?.addEventListener(
            "click",
            toggleNewSerial
        );


        /* ذخیره */

        getElement(
            "saveVisitBtn"
        )?.addEventListener(
            "click",
            saveVisit
        );


        /* چاپ */

        getElement(
            "printReportBtn"
        )?.addEventListener(
            "click",
            printReport
        );


        /* تاریخ */

        setDefaultDates();

    }
);
