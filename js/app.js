$(document).ready(function() {
  var done = function(results) { console.log(results); };

  var fail = function() { console.error("ERROR", arguments); };
  var odata = new BrsOData('https://informea.pops.int/BrsDocuments/MFiles.svc/',
  'https://informea.pops.int/CountryProfiles/bcTreatyProfile.svc',
                           done, fail);
  $("body").brsODataUI(
    {
      service: odata,  
      predefined: {
        convention: ["basel"],
        type: ["f8a0453d-86e5-e311-86cc-0050569d5de3"],
        programme: ["277ffdca-7b64-4516-a888-cc4027b19a40"]
      }
    });
});

