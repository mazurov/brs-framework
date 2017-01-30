// @codekit-prepend "brs-odata.js";
// @codekit-prepend "brs-ui.js";

$(document).ready(function() {
  var done = function(results) { console.log(results); };

  var fail = function() { console.error("SASHA", arguments); };
  var odata = new BrsOData('http://informea.pops.int/BrsDocuments/MFiles.svc/',
                           done, fail);
  var ui = new BrsODataUI(odata);
  ui.init();
//   var ds = odata.listsDataSources();
//   ds.then(function(result){
//       _.each(result, function(nds){ 
//           nds.data.read().then(function(){
//               console.log(nds.type, nds.data.view());
//           });
//       });
//   });
  
//   var attributes =
//       [{name: "Convention", op: "eq", value: "basel", quote: true}];

//   var links =
//       [{name: "Programs", op: "eq", id: "9bcc1a06-5145-452d-99d7-dca08582a4e9", quote: true}];

//   odata.findDocuments(attributes, links, done);

});