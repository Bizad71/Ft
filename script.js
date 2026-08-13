/* =========================================================
   مدیریت مراکز و بیمارستان‌ها
   ========================================================= */


/* =========================================================
   اطلاعات استان‌ها
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
   کلید ذخیره اطلاعات
   ========================================================= */

const STORAGE_KEY =
    "center_management_data";


/* =========================================================
   دریافت اطلاعات قبلی
   ========================================================= */

let database =
    JSON.parse(
        localStorage.getItem(STORAGE_KEY)
    ) || {

        centers: []

    };


/* =========================================================
   ذخیره اطلاعات
   ========================================================= */

function saveDatabase() {

    localStorage.setItem(

        STORAGE_KEY,

        JSON.stringify(database)

    );

}


/* =========================================================
   ساخت نقشه
   =========================================================
   
   فعلاً برای اینکه سایت بدون فایل اضافی اجرا شود،
   استان‌ها به شکل ناحیه‌های قابل کلیک نمایش داده می‌شوند.
   
   بعداً می‌توانیم همین قسمت را با SVG واقعی نقشه ایران
   جایگزین کنیم.
   
   ========================================================= */

function createIranMap() {

    const map =
        document.getElementById("iranMap");


    if (!map) {
        return;
    }


    map.innerHTML = "";


    const wrapper =
        document.createElement("div");

    wrapper.className =
        "province-map-list";


    provinces.forEach(
        function(province) {

            const button =
                document.createElement("button");


            button.type = "button";

            button.className =
                "province-button";


            button.textContent =
                province;


            button.dataset.province =
                province;


            button.addEventListener(
                "click",
                function() {

                    openProvince(
                        province
                    );

                }
            );


            wrapper.appendChild(
                button
            );

        }
    );


    map.appendChild(wrapper);

}


/* =========================================================
   باز کردن استان
   ========================================================= */

function openProvince(province) {

    const homeMap =
        document.querySelector(
            ".map-card"
        );


    const provincePage =
        document.getElementById(
            "provincePage"
        );


    const title =
        document.getElementById(
            "provinceTitle"
        );


    if (!provincePage) {
        return;
    }


    title.textContent =
        "🏥 مراکز استان " + province;


    homeMap.classList.add(
        "hidden"
    );


    provincePage.classList.remove(
        "hidden"
    );


    renderCenters(
        province
    );

}


/* =========================================================
   نمایش مراکز یک استان
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


    const centers =
        database.centers.filter(
            function(center) {

                return (
                    center.province ===
                    province
                );

            }
        );


    /* -----------------------------------------
       اگر مرکز وجود نداشت
       ----------------------------------------- */

    if (!centers.length) {

        const empty =
            document.createElement(
                "div"
            );


        empty.className =
            "empty-centers";


        empty.innerHTML = `

            <div class="icon">
                🏥
            </div>

            <p>
                هنوز مرکزی برای این استان ثبت نشده است.
            </p>

            <p>
                پس از ثبت اولین مرکز،
                اینجا به صورت خودکار ساخته می‌شود.
            </p>

        `;


        container.appendChild(
            empty
        );


        return;

    }


    /* -----------------------------------------
       ساخت کارت مراکز
       ----------------------------------------- */

    centers.forEach(
        function(center) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "center-card";


            const icon =
                document.createElement(
                    "div"
                );


            icon.className =
                "center-card-icon";


            icon.textContent =
                "🏥";


            const name =
                document.createElement(
                    "div"
                );


            name.className =
                "center-card-name";


            name.textContent =
                center.name;


            card.appendChild(
                icon
            );


            card.appendChild(
                name
            );


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
    );

}


/* =========================================================
   باز کردن مرکز
   =========================================================
   
   فعلاً فقط پیام می‌دهد.
   
   در مرحله بعد این قسمت تبدیل می‌شود به صفحه کامل
   اطلاعات مرکز + ربات‌ها + سوابق مراجعه.
   
   ========================================================= */

function openCenter(center) {

    alert(
        "مرکز انتخاب شد:\n\n" +
        center.name
    );

}


/* =========================================================
   برگشت به نقشه
   ========================================================= */

function backToMap() {

    const homeMap =
        document.querySelector(
            ".map-card"
        );


    const provincePage =
        document.getElementById(
            "provincePage"
        );


    provincePage.classList.add(
        "hidden"
    );


    homeMap.classList.remove(
        "hidden"
    );

}


/* =========================================================
   اتصال دکمه برگشت
   ========================================================= */

function setupButtons() {

    const backButton =
        document.getElementById(
            "backToMapBtn"
        );


    if (backButton) {

        backButton.addEventListener(
            "click",
            backToMap
        );

    }

}


/* =========================================================
   اجرای اولیه
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        createIranMap();

        setupButtons();

    }
);
