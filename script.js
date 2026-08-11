const STORAGE_KEY = "center_management_data";

let database = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
centers: []
};

let currentRobot = "";
let currentCenter = null;

/* =========================
چک لیست ربات‌ها
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
"نصب نرم‌افزار ربات",
"تنظیم ربات",
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
"نصب نرم‌افزار ربات",
"تنظیم ربات",
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
"تنظیم ربات",
"تست ربات",
"تست رایت",
"تست نهایی"
 ]

};

/* =========================
ذخیره اطلاعات
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

document.getElementById("homePage")
.classList.add("hidden");

document.getElementById("centerPage")
.classList.remove("hidden");

document.getElementById("pageTitle").innerText =
"ربات " + robot;

document.getElementById("robotModel").value =
robot;

createChecklist();

clearForm();

}

/* =========================
ساخت چک لیست
========================= */

function createChecklist(saved = []) {

const container =
document.getElementById("checklist");

container.innerHTML = "";

const list =
checklists[currentRobot] || [];

list.forEach((item, index) => {

const div =
document.createElement("div");

div.className = "check-item";

const checkbox =
document.createElement("input");

checkbox.type = "checkbox";
checkbox.id = "check_" + index;
checkbox.value = item;

if (saved.includes(item)) {
checkbox.checked = true;
}

checkbox.addEventListener(
"change",
autoSaveDraft
);

const label =
document.createElement("label");

label.htmlFor =
checkbox.id;

label.textContent =
item;

div.appendChild(checkbox);
div.appendChild(label);

container.appendChild(div);

});

}

/* =========================
خواندن چک لیست
========================= */

function getChecklistValues() {

const result = [];

document
.querySelectorAll(
"#checklist input[type='checkbox']"
)
.forEach(input => {

if (input.checked) {
result.push(input.value);
}

});

return result;

}

/* =========================
جمع کردن اطلاعات فرم
========================= */

function collectFormData() {

return {

centerName:
document.getElementById("centerName").value.trim(),

centerPhone:
document.getElementById("centerPhone").value.trim(),

centerAddress:
document.getElementById("centerAddress").value.trim(),

centerManager:
document.getElementById("centerManager").value.trim(),

labelLink:
document.getElementById("labelLink").value.trim(),

robotModel:
document.getElementById("robotModel").value.trim(),

robotSerial:
document.getElementById("robotSerial").value.trim(),

robotIP:
document.getElementById("robotIP").value.trim(),

robotMAC:
document.getElementById("robotMAC").value.trim(),

checklist:
getChecklistValues(),

extraWork:
document.getElementById("extraWork").value.trim()

};

}

/* =========================
ذخیره موقت خودکار
========================= */

function autoSaveDraft() {

if (!currentCenter) {
return;
}

currentCenter.draft =
collectFormData();

saveDatabase();

}

/* =========================
ذخیره مراجعه
========================= */

function saveVisit() {

const data =
collectFormData();

if (!data.centerName) {

alert("لطفاً نام مرکز را وارد کنید.");

return;

}

let center =
database.centers.find(
center =>
center.name.trim().toLowerCase() ===
data.centerName.trim().toLowerCase()
);

/* مرکز جدید */

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

/* بروزرسانی اطلاعات مرکز */

else {

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

}

if (!center.robots) {
center.robots = {};
}

center.robots[currentRobot] = {

serial: data.robotSerial,

ip: data.robotIP,

mac: data.robotMAC

};

/* ایجاد سابقه مراجعه */

const visit = {

id: Date.now(),

date:
new Date().toLocaleString("fa-IR"),

robot: currentRobot,

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

if (!center.visits) {
center.visits = [];
}

center.visits.unshift(visit);

center.draft = null;

saveDatabase();

currentCenter = center;

renderHistory();

alert(
"مراجعه با موفقیت ذخیره شد."
);

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

createChecklist();

currentCenter = null;

document.getElementById("history").innerHTML = "";

}

/* =========================
مرکز جدید
========================= */

function newCenter() {

clearForm();

}

/* =========================
باز کردن مرکز
========================= */

function openCenter(center) {

currentCenter = center;

document.getElementById("homePage")
.classList.add("hidden");

document.getElementById("centerPage")
.classList.remove("hidden");

document.getElementById("pageTitle").innerText =
center.name;

document.getElementById("centerName").value =
center.name || "";

document.getElementById("centerPhone").value =
center.phone || "";

document.getElementById("centerAddress").value =
center.address || "";

document.getElementById("centerManager").value =
center.manager || "";

document.getElementById("labelLink").value =
center.labelLink || "";

document.getElementById("robotModel").value =
currentRobot;

const robot =
center.robots &&
center.robots[currentRobot];

if (robot) {

document.getElementById("robotSerial").value =
robot.serial || "";

document.getElementById("robotIP").value =
robot.ip || "";

document.getElementById("robotMAC").value =
robot.mac || "";

}

createChecklist();

renderHistory();

}

/* =========================
جستجوی مراکز
========================= */

function searchCenters() {

const query =
document
.getElementById("searchCenter")
.value
.trim()
.toLowerCase();

const results =
document.getElementById("searchResults");

results.innerHTML = "";

if (!query) {
return;
}

database.centers
.filter(center =>
center.name
.toLowerCase()
.includes(query)
)
.forEach(center => {

const div =
document.createElement("div");

div.className =
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
function () {

openCenter(center);

}
);

div.appendChild(name);

div.appendChild(button);

results.appendChild(div);

});

}

/* =========================
نمایش سوابق
========================= */

function renderHistory() {

const history =
document.getElementById("history");

history.innerHTML = "";

if (!currentCenter) {
return;
}

const visits =
currentCenter.visits || [];

if (!visits.length) {

history.innerHTML =
"<p>هنوز سابقه‌ای ثبت نشده است.</p>";

return;

}

visits.forEach(visit => {

const div =
document.createElement("div");

div.className =
"history-item";

const title =
document.createElement("h3");

title.textContent =
"مراجعه: " + visit.date;

const status =
document.createElement("span");

status.className =
"status";

status.textContent =
"ربات " + visit.robot;

div.appendChild(title);

div.appendChild(status);

const workTitle =
document.createElement("p");

workTitle.innerHTML =
"<strong>کارهای انجام‌شده:</strong>";

div.appendChild(workTitle);

const list =
document.createElement("ul");

(visit.checklist || [])
.forEach(item => {

const li =
document.createElement("li");

li.textContent =
item;

list.appendChild(li);

});

div.appendChild(list);

if (visit.extraWork) {

const extra =
document.createElement("p");

extra.innerHTML =
"<strong>کارهای متفرقه:</strong><br>";

const extraText =
document.createElement("span");

extraText.textContent =
visit.extraWork;

extra.appendChild(extraText);

div.appendChild(extra);

}

history.appendChild(div);

});

}

/* =========================
گزارش چاپی / PDF
========================= */

function printReport() {

const data =
collectFormData();

if (!data.centerName) {

alert(
"ابتدا نام مرکز را وارد کنید."
);

return;

}

const reportWindow =
window.open(
"",
"_blank"
);

if (!reportWindow) {

alert(
"مرورگر پنجره جدید را مسدود کرده است."
);

return;

}

const checklistHTML =
data.checklist.length
?
data.checklist
.map(item =>
<li&gt;☑ ${escapeHTML(item)}</li>`
)
.join("")
:
"<li>هیچ کاری ثبت نشده است.</li>";

reportWindow.document.write(`

<!DOCTYPE html>

<html lang="fa" dir="rtl">

<head>

<meta charset="UTF-8">

<title>
گزارش کار - `${escapeHTML(data.centerName)}
</title>

<style>

body {
font-family: Tahoma, Arial, sans-serif;
direction: rtl;
padding: 30px;
line-height: 2;
color: #111;
}

h1 {
text-align: center;
border-bottom: 2px solid #333;
padding-bottom: 15px;
}

h2 {
border-bottom: 1px solid #999;
padding-bottom: 5px;
}

.box {
border: 1px solid #999;
padding: 15px;
margin: 20px 0;
border-radius: 8px;
}

table {
width: 100%;
border-collapse: collapse;
}

td,
th {
border: 1px solid #999;
padding: 8px;
text-align: right;
}

ul {
padding-right: 25px;
}

.extra {
white-space: pre-wrap;
}

a {
color: #0645ad;
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
<td>$`{escapeHTML(data.centerName)}</td>
</tr>

<tr>
<td>شماره تماس</td>
<td>`${escapeHTML(data.centerPhone)}</td>
</tr>

<tr>
<td>مسئول</td>
<td>$`{escapeHTML(data.centerManager)}</td>
</tr>

<tr>
<td>آدرس</td>
<td>`${escapeHTML(data.centerAddress)}</td>
</tr>

<tr>
<td>تاریخ</td>
<td>$`{new Date().toLocaleString("fa-IR")}</td>
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
<td>`${escapeHTML(data.robotModel)}</td>
</tr>

<tr>
<td>Serial Number</td>
<td>$`{escapeHTML(data.robotSerial)}</td>
</tr>

<tr>
<td>IP Address</td>
<td>`${escapeHTML(data.robotIP)}</td>
</tr>

<tr>
<td>MAC Address</td>
<td>$`{escapeHTML(data.robotMAC)}</td>
</tr>

</table>

</div>

<div class="box">

<h2>
کارهای انجام‌شده
</h2>

<ul>

`${checklistHTML}

</ul>

</div>

<div class="box">

<h2>
کارهای متفرقه
</h2>

<div class="extra">

$`{escapeHTML(
data.extraWork ||
"موردی ثبت نشده است."
)}

</div>

</div>

<div class="box">

<h2>
فایل لیبل
</h2>

${ data.labelLink ?
<a
href="${escapeHTML(data.labelLink)}"
target="_blank"
>
مشاهده / دانلود فایل لیبل
</a>
`
:
"لینک لیبل ثبت نشده است."
}

</div>

</body>

</html>

`);

reportWindow.document.close();

setTimeout(
function () {

reportWindow.print();

},
500
);

}

/* =========================
برگشت به صفحه اصلی
========================= */

function goHome() {

document.getElementById("centerPage")
.classList.add("hidden");

document.getElementById("homePage")
.classList.remove("hidden");

const search =
document.getElementById(
"searchCenter"
);

const results =
document.getElementById(
"searchResults"
);

if (search) {
search.value = "";
}

if (results) {
results.innerHTML = "";
}

currentCenter = null;

}

/* =========================
جلوگیری از HTML تزریقی
========================= */

function escapeHTML(value) {

if (!value) {
return "";
}

return String(value)

.replace(
/&/g,
"&"
)

.replace(
/</g,
"<"
)

.replace(
/>/g,
">"
)

.replace(
/"/g,
"""
)

.replace(
/'/g,
"'"
);

}

/* =========================
اتصال دکمه‌ها
========================= */

document.addEventListener(
"DOMContentLoaded",
function () {

/* انتخاب ربات */

document
.querySelectorAll(
".robot-card"
)
.forEach(card => {

card.addEventListener(
"click",
function () {

const robot =
this.dataset.robot;

selectRobot(robot);

}
);

});

/* جستجو */

const searchBtn =
document.getElementById(
"searchBtn"
);

const searchInput =
document.getElementById(
"searchCenter"
);

if (searchBtn) {

searchBtn.addEventListener(
"click",
searchCenters
);

}

if (searchInput) {

searchInput.addEventListener(
"input",
searchCenters
);

}

/* برگشت */

const backHomeBtn =
document.getElementById(
"backHomeBtn"
);

if (backHomeBtn) {

backHomeBtn.addEventListener(
"click",
goHome
);

}

/* ذخیره مراجعه */

const saveVisitBtn =
document.getElementById(
"saveVisitBtn"
);

if (saveVisitBtn) {

saveVisitBtn.addEventListener(
"click",
saveVisit
);

}

/* گزارش */

const printReportBtn =
document.getElementById(
"printReportBtn"
);

if (printReportBtn) {

printReportBtn.addEventListener(
"click",
printReport
);

}

/* مرکز جدید */

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

}
);