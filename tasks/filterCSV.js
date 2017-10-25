var moment = require("moment");
var csv = require("csv");

module.exports = function(grunt) {
  grunt.registerTask("filter", "filters csv", function() {

    var done = this.async();

    var campaigns = {
      "People for Jenny Durkan": {},
      "PEOPLE FOR MOON": {},
      "JennyDurkanforSeattle": {},
      "Cary Moon for Mayor": {}
    };
    for (var k in campaigns) {
      campaigns[k] = {
        totalContrib: 0,
        totalExp: 0,
        weeklyContrib: {},
        weeklyExp: {},
        seattle: 0,
        districts: {},
        external: 0,
        contributions: 0,
        expenditures: 0
      }
      for (var i = 1; i <= 7; i++) {
        campaigns[k].districts[i] = 0;
      }
    };

    var input = grunt.file.read("./temp/contributions.csv");
    var parser = csv.parse(input, { auto_parse: true, columns: true }, function(err, rows) {

      rows.forEach(function(row) {
        if (!(row.strCampaignName in campaigns)) return;

        var contribution = row.moneyContributionsEffect_SEEC;
        var expenditure = row.moneyExpendituresEffect_SEEC;
        if (!contribution && !expenditure) return;
        var district = row.intCodedDistrict_SEEC > 7 ? "": row.intCodedDistrict_SEEC;
        var [month, day, year] = row.strTransactionDate.split("/").map(Number);
        var date = new moment([year < 2000 ? year + 2000 : year, month - 1, day]);
        // month-1 so that it becomes a computer month
        var week = date.week();
        console.log(row.strTransactionDate, date.format("MM/D/YY"), week)

        var name = row.strCampaignName;
        var campaign = campaigns[name];

        if (contribution) {

          campaign.totalContrib += contribution;
          campaign.contributions++;

          if (district) {
            campaign.districts[district] += contribution;
          } else {
            campaign.external += contribution
          }

          if (!campaign.weeklyContrib[week]) {
            campaign.weeklyContrib[week] = contribution;
          } else {
            campaign.weeklyContrib[week] += contribution;
          }
        }


        if (expenditure) {
          campaign.totalExp += expenditure;
          campaign.expenditures++;

          if (!campaign.weeklyExp[week]) {
            campaign.weeklyExp[week] = expenditure;
          } else {
            campaign.weeklyExp[week] += expenditure;
          }
        }
        
      });

      grunt.file.write("data/campaigns.json", JSON.stringify(campaigns, null, 2));

      done();


    });
  })    
}

