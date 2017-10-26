// require("./lib/social");
// require("./lib/ads");
// var track = require("./lib/tracking");

var $ = require("./lib/qsa");
var colors = require("./lib/colors");

require("component-responsive-frame/child");
var dot = require("./lib/dot");
var cardTemplate = dot.compile(require("./_card.html"));

var dollars = function(n) {
  var fixed = n.toFixed(2);
  var dot = fixed.indexOf(".");
  for (var i = dot - 3; i >= 1; i -= 3) {
    fixed = fixed.slice(0, i) + "," + fixed.slice(i);
  }
  return fixed;
};

var html = "";
for (var x in window.contribData) {
  var campaign = window.contribData[x];
  html += cardTemplate({ name: x, campaign, format: dollars });
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
  var maxContrib = Math.max.apply(null, contributions);
  var maxExp = Math.max.apply(null, expenditures);
  var max = Math.max(maxContrib, maxExp);
  var scaleY = v => v / max;
  var scaleX = v => (v - earliest) / (latest - earliest);

  var context = canvas.getContext("2d");
  context.lineWidth = 2;

  var maxContribLabel = $.one(".highest-contribution", canvas.parentElement);
  var maxExpLabel = $.one(".highest-expenditure", canvas.parentElement);

  var drawArea = function(values, flipped, label, max) {
    context.moveTo(0, canvas.height * .5);
    var maxX = 0;
    for (var i = earliest; i <= latest; i++) {
      var val = values[i] || 0;
      var x = scaleX(i) * canvas.width;
      if (flipped) {
        var y = scaleY(val) * canvas.height * .4 + canvas.height * .5;
      } else {
        var y = (1 - scaleY(val)) * canvas.height * .4 + canvas.height * .1;
      }
      context.lineTo(x, y);
      if (val == max) {
        maxX = x;
        label.innerHTML = "$" + dollars(max);
        var percent = scaleX(i) * 100;
        if (percent > 50) {
          label.style.right = (100 - percent) + "%";
        } else {
          label.style.left = percent + "%";
        }
      }
    }
    context.lineTo(canvas.width, canvas.height * .5);
    context.stroke();
    context.fill();

    if (maxX) {
      context.beginPath();
      context.lineWidth = 1;
      context.strokeStyle = "black";
      context.moveTo(maxX, canvas.height * .5);
      context.lineTo(maxX, flipped ? canvas.height : 0);
      context.stroke();
    }
  };

  context.beginPath();
  context.lineWidth = 3; // green line width
  context.strokeStyle = colors.palette.stDarkGreen;
  context.fillStyle = colors.palette.stLightGreen;
  drawArea(campaign.weeklyContrib, false, maxContribLabel, maxContrib);

  context.beginPath();
  context.lineWidth = 3; // orange line width
  context.strokeStyle = colors.rgb(234, 112, 20);
  context.fillStyle = colors.rgb(254, 196, 79);
  drawArea(campaign.weeklyExp, true, maxExpLabel, maxExp);

  context.beginPath();
  context.lineWidth = 1;
  context.moveTo(0, canvas.height * .5);
  context.lineTo(canvas.width, canvas.height * .5);
  context.strokeStyle = colors.palette.dfOffBlack;
  context.stroke();

  var latestDate = window.weekText[latest];

  $.one(".latest-week", canvas.parentElement).innerHTML = latestDate;
});

var dropdown = $(".dropdown");
var dropdownList = $(".dropdownList")

var showDropdown = function() {
  this.parentElement.classList.toggle("collapsed");
};


dropdown.forEach(e => e.addEventListener("click", showDropdown));