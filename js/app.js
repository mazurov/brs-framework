var BrsOData = function(url, done, fail) {
  this.url = url;
  this.fail = fail || function() {};
  this.done = done || function() {};
};

BrsOData.prototype.ODATA3SCHEMA = {
  data: function(data) { return data.value; },
  total: function(data) { return data["odata.count"]; }
};

BrsOData.prototype.getDataSource = function(entryUrl, data, fields, sort) {

  return new kendo.data.DataSource({
    type: "odata",
    transport: {
                 read: {
                   url: this.url + "/" + entryUrl + "/",
                   dataType: "jsonp",
                   data: $.extend({$inlinecount: "allpages"}, data)
                 }
               },
    sort: sort,
    serverSorting: true,
    schema: {
      data: function(data) { return data.value; },
      total: function(data) { return data["odata.count"]; },
      serverPaging: true,
      model: {fields: fields}
    }
  });
};

BrsOData.prototype
    .CONVENTIONS = [{name: "basel"}, {name: "rotterdam"}, {name: "stockholm"}];

BrsOData.prototype.LANGUAGES = [
  {code: "en", name: "English", title: "English"},
  {code: "fr", name: "French", title: "Français"},
  {code: "es", name: "Spanish", title: "Español"},
  {code: "ru", name: "Russian", title: "Русский"},
  {code: "ar", name: "Arabic", title: "العربية"},
  {code: "zh", name: "Chinese", title: "中国的"}
];

BrsOData.prototype.LISTTYPETOFIELD = {
    term: 'Terms',
    programme: 'Programs',
    tag: 'Tags',
    meetingtype: 'MeetingTypes',
    chemical: 'Chemicals',
    meeting: 'Meetings',
    type: 'Types'
};


BrsOData.prototype.listTypesDataSource = function() {
  return this.getDataSource("ValueTypes", undefined,
                            {id: "ListPropertyTypeId", value: "Name"});
};


BrsOData.prototype.conventionsDataSource = function() {
  return new kendo.data.DataSource({
    type: "json",
    data: this.CONVENTIONS,
    sort: {field: "value", dir: "asc"},
    schema: {model: {fields: {value: "name"}}}
  });
};

BrsOData.prototype.languagesDataSource = function() {
  return new kendo.data.DataSource({
    type: "json",
    data: this.LANGUAGES,
    schema: {model: {fields: {id: "code", value: "title"}}}
  });
};

BrsOData.prototype.yearsDataSource = function(startYear) {
  var currYear = new Date().getFullYear();
  if (startYear > currYear){
    throw "start year '" + startYear +"' should be less then current year '" + currYear + "'";
  }

  var years = [];
  for (var y = currYear; y >= startYear; --y){
    years.push({value: y});
  }

  return new kendo.data.DataSource({
    type: "json",
    data: years
  });
};
BrsOData.prototype.listTypeToField = function(name) {
  return this.LISTTYPETOFIELD[name];
}
BrsOData.prototype.listsDataSources = function() {
  var ds = this.listTypesDataSource();
  var self = this;
  return ds.read().then(
      // ------------------------------------------------------------------------
      function() {
        var result = [];
        _.each(
            ds.view(),
            // ----------------------------------------------------------------------
            function(view) {
              var ds = self.getDataSource(
                  "Values",
                  {
                    $filter: "Types/any(x: x/ListPropertyTypeId eq guid'" +
                                 view.id + "')"
                  },
                  {id: "ListPropertyId", value: "Value"},
                  {field: "value", dir: "asc"});
              result.push({type: view.value, data: ds});
            });
        return result;
        // ----------------------------------------------------------------------
      });
  // ------------------------------------------------------------------------
};
BrsOData.prototype._odataOr = function(field, values) {
  var exp = [];
  for(var i in values){
     exp.push(field + " eq '" + values[i] + "'");
  }
  return exp.join(' or ');
}

BrsOData.prototype._odataExpandOr = function(expand, field, values) {
  var exp = [];
  for(var i in values){
     var strValue = "'" + values[i] + "'";
     if (this.isGUID(values[i])){
       strValue = 'guid' + strValue;
     } 
     exp.push(expand + "/any(x: x/" + field + " eq " + strValue + ")");
  }
  return exp.join(' or ');
}


BrsOData.prototype.isGUID = function(value){
  var regexGuid = /^(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}$/gi;
  return regexGuid.test(value);
}
BrsOData.prototype.documentsDataSource = function(filters) {
  var andFilter = [];
  var filter = '';
  if (filters){
    for(var type in filters) {
      var values = filters[type];
      if (values.length > 0) {
        switch (type) {
          case 'convention':
            andFilter.push('(' + this._odataOr('Convention', values) + ')');
            break;
          case 'language':
            andFilter.push('(' + this._odataExpandOr('Titles', 'Language', values) + ')');
            break;
          default:
            var expand = this.listTypeToField(type)
            andFilter.push('(' + this._odataExpandOr(expand, 'ListPropertyId', values) + ')');
            break;
        }
      }
    }
  }
  filter = andFilter.join(' and ');
  return this.getDataSource("Documents", {"$expand": "Titles,Files", "$filter": filter});
};


var BrsODataUI = function(service, parentEl) { 
  this.service = service; 
  this.parentEl = $(parentEl);
  this.filters = {
    convention: [],
    language: [],
    year: [],
    term: [],
    programme: [],
    tag: [],
    meetingtype: [],
    chemical: [],
    meeting: [],
    type: []
  };
};

BrsODataUI.prototype.init = function() {
  var self = this;
  this.service.listsDataSources().then(_processLists);
  _processConventions(this.service.conventionsDataSource());
  _processDocuments(this.service.documentsDataSource());
  _processLanguages(this.service.languagesDataSource());
  _processYears(this.service.yearsDataSource(2005));

  // --------------------------------------------------------------------------
  // function _dataSourceRequest(startOrEnd){
  //   $("div[data-brs-filters-loading]").each(function(index, loadingEl){
  //     kendo.ui.progress($(loadingEl), startOrEnd != "end" ); 
  //   }
  //   );
  // }
  // --------------------------------------------------------------------------
  function _onFiltersChange(e) {
    var type = $(e.sender.element).data("brs-filter");
    self.filters[type] = this.value();

    var ds = self.service.documentsDataSource(self.filters);
    _processDocuments(ds);
  }

  function _processLists(dss) {
    $("select[data-brs-list]", this.parentEl).each(function(index, el) {
      var type = $(el).data("brs-filter");
      var ds = _.find(dss, function(o) { return o.type == type; }).data;
      //ds.bind("requestStart", _dataSourceRequest("start"));
      //ds.bind("requestEnd", _dataSourceRequest("end"));
      $(el).kendoMultiSelect(
          {dataSource: ds, dataTextField: "value", dataValueField: "id", change: _onFiltersChange});
    });
  }

  function _processConventions(ds) {
    $("select[data-brs-filter='convention']", this.parentEl).each(function(index, el) {
      $(el).kendoMultiSelect(
          {dataSource: ds, dataTextField: "value", dataValueField: "value", change: _onFiltersChange});
    });
  }

  function _processLanguages(ds) {
    $("select[data-brs-filter='language']", this.parentEl).each(function(index, el) {

      $(el).kendoMultiSelect(
          {dataSource: ds, dataTextField: "value", dataValueField: "id", change: _onFiltersChange});
    });
  }

  function _processYears(ds) {
    console.log(ds);
    $("select[data-brs-filter='year']", this.parentEl).each(function(index, el) {
      $(el).kendoMultiSelect(
          {dataSource: ds, dataTextField: "value", dataValueField: "value", change: _onFiltersChange});
    });
  }

  function _processDocuments(ds) {
    $("table[data-brs-documents]", this.parentEl).each(function(index, el) {
      var tmpl = $("#" + $(el).data("brs-documents"));
      var pager = $("#" + $(el).data("brs-documents-pager"));

      $(el).kendoListView({dataSource: ds, template: tmpl.html()});
      pager.kendoPager({
         dataSource: ds
      });
    });
  }

  // --------------------------------------------------------------------------
};

// @codekit-prepend "brs-odata.js";
// @codekit-prepend "brs-ui.js";

$(document).ready(function() {
  var done = function(results) { console.log(results); };

  var fail = function() { console.error("SASHA", arguments); };
  var odata = new BrsOData('http://informea.pops.int/BrsDocuments/MFiles.svc/',
                           done, fail);
  var ui = new BrsODataUI(odata, "body");
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

