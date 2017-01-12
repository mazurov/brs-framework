// @codekit-prepend "brs-odata.js";


$(document).ready(function() {
  var done = function(results) { console.log(results); };

  var fail = function() { console.error("SASHA", arguments); };
  var odata = new BrsOData('http://informea.pops.int/BrsDocuments/MFiles.svc/',
                           done, fail);
  // odata.load();

  var attributes =
      [{name: "Convention", op: "eq", value: "basel", quote: true}];

  var links =
      [{name: "Programs", op: "eq", id: "9bcc1a06-5145-452d-99d7-dca08582a4e9", quote: true}];

  odata.findDocuments(attributes, links, done);

});