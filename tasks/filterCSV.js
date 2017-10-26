var moment = require("moment");
var csv = require("csv");

module.exports = function(grunt) {
  grunt.registerTask("filter", "filters csv", function() {

    var done = this.async();

    var campaigns = {
      "JennyDurkanforSeattle": {
        name: "Jenny Durkan for Seattle",
        type: "Campaign",
        candidate: "Jenny Durkan",
        home: 7
      },
      "Cary Moon for Mayor": {
        name: "Cary Moon for Mayor",
        type: "Campaign",
        candidate: "Cary Moon",
        home: 7
      },
      "People for Jenny Durkan": {
        name: "People for Jenny Durkan",
        type: "IEC",
        candidate: "Jenny Durkan",
        home: 7
      },
      "PEOPLE FOR MOON": {
        name: "People for Moon",
        type: "IEC",
        candidate: "Cary Moon",
        home: 7
      }
    };
    for (var k in campaigns) {
      var { name, type, candidate, home } = campaigns[k];
      campaigns[k] = {
        name,
        type,
        candidate,
        home,
        totalContrib: 0,
        totalExp: 0,
        weeklyContrib: {},
        weeklyExp: {},
        seattle: 0,
        districts: { other: 0 },
        external: 0,
        selfFund: 0,
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
        var transactor = row.strTransactorName;
        var PDC = row.strPDCFormLineNumber;

        if (!contribution && !expenditure) return;
        var district = row.intCodedDistrict_SEEC;
        var [month, day, year] = row.strTransactionDate.split("/").map(Number);
        var date = new moment([year < 2000 ? year + 2000 : year, month - 1, day]);
        // month-1 so that it becomes a computer month
        var week = date.week();

        var name = row.strCampaignName;
        var campaign = campaigns[name];

        // var candidate = campaigns[candidate];

        // if ((transactor == candidate) || PDC) {
        //   campaigns[selfFund] = 2;
        // }

        if (contribution) {

          campaign.totalContrib += contribution;
          campaign.contributions++;

          if ((transactor == campaign.candidate) || (PDC == "C3.1B")) {
            campaign.selfFund += contribution;
            campaign.districts[campaign.home] += contribution;
          } else if (district && district <= 7) {
            campaign.districts[district] += contribution;
          } else if (district == 91) {
            campaign.external += contribution
            campaign.districts.other += contribution;
          } else {
            campaign.districts.other += contribution;
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

