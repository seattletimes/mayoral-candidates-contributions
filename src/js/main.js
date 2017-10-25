// require("./lib/social");
// require("./lib/ads");
// var track = require("./lib/tracking");

var $ = require("./lib/qsa");
var colors = require("./lib/colors");

require("component-responsive-frame/child");
var dot = require("./lib/dot");
var cardTemplate = dot.compile(require("./_card.html"));

var html = "";
for (var x in window.contribData) {
  var campaign = window.contribData[x];
  html += cardTemplate({ name: x, campaign });
}

$.one(".cards").innerHTML = html;

var latestWeekDate = $(".latest-week");

$(".weekly-money").forEach(function(canvas) {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  var cname = canvas.getAttribute("data-campaign");
  var campaign = window.contribData[cname];
  var weeks = Object.keys(campaign.weeklyContrib).map(Number);
  var earliest = 16;//Math.min.apply(null, weeks);
  var latest = Math.max.apply(null, weeks);
  var contributions = Object.keys(campaign.weeklyContrib).map(k => campaign.weeklyContrib[k]);
  var expenditures = Object.keys(campaign.weeklyExp).map(k => campaign.weeklyExp[k]);
  var max = Math.max(
    Math.max.apply(null, contributions),
    Math.max.apply(null, expenditures)
  );
  var scaleY = v => v / max;
  var scaleX = v => (v - earliest) / (latest - earliest);

  var context = canvas.getContext("2d");
  context.lineWidth = 2;

  context.beginPath();
  context.strokeStyle = colors.palette.stDarkGreen;
  context.fillStyle = colors.palette.stLightGreen;
  context.moveTo(0, canvas.height * .5);
  for (var i = earliest; i <= latest; i++) {
    var val = campaign.weeklyContrib[i] || 0;
    var x = scaleX(i) * canvas.width;
    var y = (1 - scaleY(val)) * canvas.height * .5;
    context.lineTo(x, y);
  }
  context.lineTo(canvas.width, canvas.height * .5);
  context.stroke();
  context.fill();

  context.beginPath();
  context.strokeStyle = colors.palette.stDarkOrange;
  context.fillStyle = colors.palette.stLightOrange;
  context.moveTo(0, canvas.height * .5);
  for (var i = earliest; i <= latest; i++) {
    var val = campaign.weeklyExp[i] || 0;
    var x = scaleX(i) * canvas.width;
    var y = scaleY(val) * canvas.height * .5 + canvas.height * .5;
    context.lineTo(x, y);
  }
  context.lineTo(canvas.width, canvas.height * .5);
  context.stroke();
  context.fill();

  context.beginPath();
  context.lineWidth = 1;
  context.moveTo(0, canvas.height * .5);
  context.lineTo(canvas.width, canvas.height * .5);
  context.strokeStyle = colors.palette.dfOffBlack;
  context.stroke();

  var latestDate = window.weekText[latest];
  console.log(latestDate);

  latestWeekDate.forEach(e => e.innerHTML = latestDate);
});

var dropdown = $(".dropdown");
var dropdownList = $(".dropdownList")

var showDropdown = function() {
  this.parentElement.classList.toggle("collapsed");
};


dropdown.forEach(e => e.addEventListener("click", showDropdown));