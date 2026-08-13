/* =========================================================
   مدیریت مراکز و بیمارستان‌ها
========================================================= */


/* =========================================================
   تنظیمات
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
   نمایش صفحه
========================================================= */

function showPage(pageId) {

    document
        .querySelectorAll(".page")
        .forEach(function(page) {

            page.classList.add("hidden");

        });


    const page =
        document.getElementById(pageId);


    if (page) {

        page.classList.remove(
            "hidden"
        );

    }

}


/* =========================================================
   بارگذاری نقشه ایران
========================================================= */

async function loadIranMap() {

    const mapContainer =
        document.getElementById(
            "iranMap"
        );


    if (!mapContainer) {
        return;
    }


    try {

        const response =
            await fetch("iran.svg");


        if (!response.ok) {

            throw new Error(
                "فایل iran.svg پیدا نشد."
            );

        }


        const svgText =
            await response.text();


        mapContainer.innerHTML =
            svgText;


        setupProvinceMap();


    } catch (error) {

        console.error(error);


        mapContainer.innerHTML = `

            <div class="map-loading">

                <div>

                    ❌ نقشه ایران بارگذاری نشد.

                    <br><br>

                    <small>
                        مطمئن شوید فایل
                        <strong>iran.svg</strong>
                        کنار فایل‌های سایت قرار دارد.
                    </small>

                </div>

            </div>

        `;

    }

}


/* =========================================================
   اتصال استان‌های نقشه
========================================================= */

function setupProvinceMap() {

    const map =
        document.getElementById(
            "iranMap"
        );


    if (!map) {
        return;
    }


    /*
       استان‌ها باید در SVG دارای یکی از این موارد باشند:

       data-province="تهران"

       یا

       id="tehran"

       یا

       class="province"
    */


    const provinces =
        map.querySelectorAll(
            "[data-province]"
        );


    provinces.forEach(
        function(province) {

            province.classList.add(
                "province"
            );


            province.addEventListener(
                "click",
                function(event) {

                    event.preventDefault();

                    event.stopPropagation();


                    const name =
                        this.dataset.province;


                    if (!name) {
                        return;
                    }


                    openProvince(
                        name
                    );

                }
            );

        }
    );

}


/* =========================================================
   باز کردن استان
========================================================= */

function openProvince(province) {

    currentProvince =
        province;


    currentCenter =
        null;


    const title =
        document.getElementById(
            "provinceTitle"
        );


    if (title) {

        title.textContent =
            "🏥 مراکز استان " +
            province;

    }


    showPage(
        "provincePage"
    );


    renderCenters(
        province
    );

}


/* =========================================================
   نمایش مراکز استان
========================================================= */

function renderCenters(province) {

    const container =
        document.getElementById(
            "centerList"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    /*
       فقط مراکز همین استان
    */

    const centers =
        database.centers.filter(
            function(center) {

                return (
                    center.province ===
                    province
                );

            }
        );


    /*
       اگر مرکز وجود نداشت
    */

    if (!centers.length) {

        container.innerHTML = `

            <div class="empty-centers">

                <div class="icon">
                    🏥
                </div>

                <p>
                    هنوز مرکزی در این استان ثبت نشده است.
                </p>

                <p>
                    برای ثبت اولین مرکز،
                    روی دکمه «افزودن مرکز جدید» بزنید.
                </p>

            </div>

        `;

        return;

    }


    /*
       ساخت کارت هر مرکز
    */

    centers.forEach(
        function(center) {

            createCenterCard(
                center,
                container
            );

        }
    );

}


/* =========================================================
   ساخت کارت مرکز
========================================================= */

function createCenterCard(
    center,
    container
) {

    const card =
        document.createElement(
            "div"
        );


    card.className =
        "center-card";


    card.dataset.id =
        center.id;


    /*
       آیکون
    */

    const icon =
        document.createElement(
            "div"
        );


    icon.className =
        "center-card-icon";


    icon.textContent =
        "🏥";


    /*
       نام مرکز
    */

    const name =
        document.createElement(
            "div"
        );


    name.className =
        "center-card-name";


    name.textContent =
        center.name;


    /*
       استان
    */

    const province =
        document.createElement(
            "div"
        );


    province.style.color =
        "#8b949e";


    province.style.fontSize =
        "13px";


    province.style.marginTop =
        "8px";


    province.textContent =
        center.province;


    card.appendChild(
        icon
    );


    card.appendChild(
        name
    );


    card.appendChild(
        province
    );


    /*
       باز کردن مرکز
    */

    card.addEventListener(
        "click",
        function() {

            openCenter(
                center
            );

        }
    );


    container.appendChild(
        card
    );

}


/* =========================================================
   باز کردن فرم مرکز جدید
========================================================= */

function openNewCenterForm() {

    /*
       استان انتخاب شده
    */

    const provinceInput =
        document.getElementById(
            "newCenterProvince"
        );


    if (provinceInput) {

        provinceInput.value =
            currentProvince;

    }


    /*
       پاک کردن فرم
    */

    clearNewCenterForm();


    /*
       دوباره استان را قرار می‌دهیم
       چون clear فرم آن را پاک می‌کند.
    */

    if (provinceInput) {

        provinceInput.value =
            currentProvince;

    }


    showPage(
        "centerFormPage"
    );


    /*
       فوکوس روی نام مرکز
    */

    const nameInput =
        document.getElementById(
            "newCenterName"
        );


    if (nameInput) {

        setTimeout(
            function() {

                nameInput.focus();

            },
            100
        );

    }

}


/* =========================================================
   پاک کردن فرم مرکز جدید
========================================================= */

function clearNewCenterForm() {

    const fields = [

        "newCenterName",

        "newCenterPhone",

        "newCenterManager",

        "newCenterAddress",

        "newCenterLabelLink"

    ];


    fields.forEach(
        function(id) {

            const input =
                document.getElementById(
                    id
                );


            if (input) {

                input.value = "";

            }

        }
    );

}


/* =========================================================
   دریافت اطلاعات مرکز جدید
========================================================= */

function getNewCenterData() {

    return {

        name:
            document
                .getElementById(
                    "newCenterName"
                )
                .value
                .trim(),


        phone:
            document
                .getElementById(
                    "newCenterPhone"
                )
                .value
                .trim(),


        manager:
            document
                .getElementById(
                    "newCenterManager"
                )
                .value
                .trim(),


        address:
            document
                .getElementById(
                    "newCenterAddress"
                )
                .value
                .trim(),


        labelLink:
            document
                .getElementById(
                    "newCenterLabelLink"
                )
                .value
                .trim()

    };

}


/* =========================================================
   ذخیره مرکز جدید
========================================================= */

function saveNewCenter() {

    const data =
        getNewCenterData();


    /*
       نام مرکز اجباری است
    */

    if (!data.name) {

        alert(
            "لطفاً نام مرکز را وارد کنید."
        );

        document
            .getElementById(
                "newCenterName"
            )
            .focus();

        return;

    }


    /*
       استان باید مشخص باشد
    */

    if (!currentProvince) {

        alert(
            "استان مرکز مشخص نیست."
        );

        return;

    }


    /*
       بررسی مرکز تکراری در همان استان
    */

    const duplicate =
        database.centers.find(
            function(center) {

                return (

                    center.province ===
                    currentProvince

                    &&

                    center.name
                        .trim()
                        .toLowerCase() ===
                    data.name
                        .trim()
                        .toLowerCase()

                );

            }
        );


    if (duplicate) {

        alert(
            "این مرکز قبلاً در این استان ثبت شده است."
        );

        return;

    }


    /*
       ساخت مرکز
    */

    const center = {

        id:
            Date.now() +
            Math.random(),


        province:
            currentProvince,


        name:
            data.name,


        phone:
            data.phone,


        manager:
            data.manager,


        address:
            data.address,


        labelLink:
            data.labelLink,


        robots: {},


        visits: [],


        createdAt:
            new Date().toISOString()

    };


    /*
       اضافه کردن به دیتابیس
    */

    database.centers.push(
        center
    );


    /*
       ذخیره
    */

    saveDatabase();


    /*
       مرکز جدید را به عنوان مرکز فعلی قرار می‌دهیم
    */

    currentCenter =
        center;


    /*
       نمایش دوباره استان
    */

    renderCenters(
        currentProvince
    );


    /*
       رفتن به صفحه استان
    */

    showPage(
        "provincePage"
    );


    alert(
        "مرکز با موفقیت ثبت شد."
    );

}


/* =========================================================
   باز کردن مرکز
========================================================= */

function openCenter(center) {

    currentCenter =
        center;


    const title =
        document.getElementById(
            "centerPageTitle"
        );


    if (title) {

        title.textContent =
            center.name;

    }


    renderCenterInfo(
        center
    );


    showPage(
        "centerPage"
    );

}


/* =========================================================
   نمایش اطلاعات مرکز
========================================================= */

function renderCenterInfo(center) {

    const container =
        document.getElementById(
            "centerInfo"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    const info =
        document.createElement(
            "div"
        );


    info.className =
        "center-info";


    addInfoRow(
        info,
        "استان",
        center.province
    );


    addInfoRow(
        info,
        "نام مرکز",
        center.name
    );


    addInfoRow(
        info,
        "شماره تماس",
        center.phone
    );


    addInfoRow(
        info,
        "نام مسئول",
        center.manager
    );


    addInfoRow(
        info,
        "آدرس",
        center.address
    );


    addInfoRow(
        info,
        "لینک فایل لیبل",
        center.labelLink
    );


    container.appendChild(
        info
    );

}


/* =========================================================
   ساخت ردیف اطلاعات
========================================================= */

function addInfoRow(
    container,
    label,
    value
) {

    const row =
        document.createElement(
            "div"
        );


    row.className =
        "info-row";


    const labelElement =
        document.createElement(
            "span"
        );


    labelElement.className =
        "info-label";


    labelElement.textContent =
        label;


    const valueElement =
        document.createElement(
            "div"
        );


    valueElement.className =
        "info-value";


    valueElement.textContent =
        value || "ثبت نشده";


    row.appendChild(
        labelElement
    );


    row.appendChild(
        valueElement
    );


    container.appendChild(
        row
    );

}


/* =========================================================
   برگشت به نقشه
========================================================= */

function backToMap() {

    currentProvince = "";

    currentCenter = null;


    showPage(
        "mapPage"
    );

}


/* =========================================================
   برگشت به صفحه استان
========================================================= */

function backToProvince() {

    currentCenter = null;


    showPage(
        "provincePage"
    );


    renderCenters(
        currentProvince
    );

}


/* =========================================================
   انصراف از ثبت مرکز
========================================================= */

function cancelNewCenter() {

    clearNewCenterForm();


    showPage(
        "provincePage"
    );


    renderCenters(
        currentProvince
    );

}


/* =========================================================
   اتصال دکمه‌ها
========================================================= */

function setupButtons() {


    /* -----------------------------------------
       افزودن مرکز
    ----------------------------------------- */

    const addCenterBtn =
        document.getElementById(
            "addCenterBtn"
        );


    if (addCenterBtn) {

        addCenterBtn.addEventListener(
            "click",
            openNewCenterForm
        );

    }


    /* -----------------------------------------
       ذخیره مرکز
    ----------------------------------------- */

    const saveBtn =
        document.getElementById(
            "saveNewCenterBtn"
        );


    if (saveBtn) {

        saveBtn.addEventListener(
            "click",
            saveNewCenter
        );

    }


    /* -----------------------------------------
       انصراف
    ----------------------------------------- */

    const cancelBtn =
        document.getElementById(
            "cancelNewCenterBtn"
        );


    if (cancelBtn) {

        cancelBtn.addEventListener(
            "click",
            cancelNewCenter
        );

    }


    /* -----------------------------------------
       برگشت به نقشه
    ----------------------------------------- */

    const backMapBtn =
        document.getElementById(
            "backToMapBtn"
        );


    if (backMapBtn) {

        backMapBtn.addEventListener(
            "click",
            backToMap
        );

    }


    /* -----------------------------------------
       برگشت از فرم
    ----------------------------------------- */

    const backProvinceBtn =
        document.getElementById(
            "backToProvinceBtn"
        );


    if (backProvinceBtn) {

        backProvinceBtn.addEventListener(
            "click",
            cancelNewCenter
        );

    }


    /* -----------------------------------------
       برگشت از مرکز
    ----------------------------------------- */

    const backCentersBtn =
        document.getElementById(
            "backToCentersBtn"
        );


    if (backCentersBtn) {

        backCentersBtn.addEventListener(
            "click",
            backToProvince
        );

    }

}


/* =========================================================
   شروع برنامه
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        setupButtons();

        loadIranMap();

    }
);
