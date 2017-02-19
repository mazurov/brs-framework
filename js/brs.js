var BrsOData = function(url, done, fail) {
  this.url = url;
  this.fail = fail || function() {};
  this.done = done || function() {};
};

BrsOData.CONVENTIONS = [{name: "basel"}, {name: "rotterdam"}, {name: "stockholm"}];

BrsOData.LANGUAGES = [
  {id: "en", name: "English", value: "English"},
  {id: "fr", name: "French", value: "Français"},
  {id: "es", name: "Spanish", value: "Español"},
  {id: "ru", name: "Russian", value: "Русский"},
  {id: "ar", name: "Arabic", value: "العربية"},
  {id: "zh", name: "Chinese", value: "中国的"},
  {id: "pt", name: "Portuguese", value: "Portuguese"}
  
];


BrsOData.LISTTYPETOFIELD = {
    term: 'Terms',
    programme: 'Programs',
    tag: 'Tags',
    meetingtype: 'MeetingsTypes',
    chemical: 'Chemicals',
    meeting: 'Meetings',
    type: 'Types'
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
    serverPaging: true,
      serverSorting: true,
    schema: {
      data: function(data) { return data.value; },
      total: function(data) { return data["odata.count"]; },
      serverPaging: true,
      model: {fields: fields}
    }
  });
};



BrsOData.prototype.listTypesDataSource = function() {
  return this.getDataSource("ValueTypes", undefined,
                            {id: "ListPropertyTypeId", value: "Name"});
};


BrsOData.prototype.conventionsDataSource = function() {
  return new kendo.data.DataSource({
    type: "json",
    data: BrsOData.CONVENTIONS.slice(),
    sort: {field: "value", dir: "asc"},
    schema: {model: {fields: {value: "name"}}}
  });
};

BrsOData.prototype.languagesDataSource = function() {
  return new kendo.data.DataSource({
    type: "json",
    data: $.merge([], BrsOData.LANGUAGES)
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
  return BrsOData.LISTTYPETOFIELD[name];
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
  var quote = "'";
  for(var i in values){
    if(typeof values[i] == 'number'){
	    quote = "";
    }
    exp.push(field + " eq " + quote + values[i] + quote);
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
          case 'year':
            andFilter.push('(' + this._odataOr('year(PublicationDate)', values) + ')');
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
  return this.getDataSource("Documents", {"$expand": "Titles,Descriptions,Files", "$filter": filter});
};


$.fn.brsODataUI = function(options) { 
  var self = this;
  var service = options.service; 
  var predefined = options.predefined || {};
  var template = options.template; 

  var filters = {
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

  filters = jQuery.extend(filters, predefined);

  service.listsDataSources().then(_processLists);
  _processConventions(service.conventionsDataSource());
  _processDocuments(service.documentsDataSource(filters));
  _processLanguages(service.languagesDataSource());
  _processYears(service.yearsDataSource(2005));
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
    filters[type] = this.value();

    var ds = service.documentsDataSource(filters);
    _processDocuments(ds);
  }

  function _processLists(dss) {
    $("select[data-brs-list]", self.parentEl).each(function(index, el) {
      var type = $(el).data("brs-filter");
      var ds = _.find(dss, function(o) { return o.type == type; }).data;

      $(el).kendoMultiSelect(
          {
            dataSource: ds,
            dataTextField: "value",
            dataValueField: "id",
            change: _onFiltersChange}
      ).data("kendoMultiSelect").value(filters[type]);
    });
  }

  function _processConventions(ds) {
    $("select[data-brs-filter='convention']", self.parentEl).each(function(index, el) {
      $(el).kendoMultiSelect(
          {dataSource: ds, dataTextField: "value", dataValueField: "value", change: _onFiltersChange}).data("kendoMultiSelect").value(filters.convention);
    });
  }

  function _processLanguages(ds) {
    $("select[data-brs-filter='language']", self.parentEl).each(function(index, el) {

      $(el).kendoMultiSelect(
          {dataSource: ds, dataTextField: "value", dataValueField: "id", change: _onFiltersChange});
    });
  }

  function _processYears(ds) {
    $("select[data-brs-filter='year']", self.parentEl).each(function(index, el) {
      $(el).kendoMultiSelect(
          {dataSource: ds, dataTextField: "value", dataValueField: "value", change: _onFiltersChange});
    });
  }

  function _processDocuments(ds) {
    ds.pageSize(20);
    ds.sort({ field: "PublicationDate", dir: "desc"});

    $("tbody[data-brs-documents]", self.parentEl).each(function(index, el) {
      var tmpl = template || kendo.template($("#brs-template").html());
      var pager = $(".brs-documents-pager");

      $(el).kendoListView({
        dataSource: ds,
        template: tmpl,
        dataBound: function() { 
          $(".brs-tabstrip", self).each(
            function() {
               var tab;
               if (filters.language.length == 0){
                tab = $("li:first-child");
               }else{
                 for(var i = filters.language.length - 1; i >=0; i--){
                    tab =  $(".brs-tab-" +  filters.language[i], this);
                    if (tab.size() > 0) break;
                 }
               }
               $(this).kendoTabStrip().data("kendoTabStrip").activateTab(tab);
            }
          );
        
        },
      });
      pager.kendoPager({
         dataSource: ds
      });
    });
  }

  // --------------------------------------------------------------------------
};

/**
 * filters: [Object,...]
 *  Object: {
 *      type: "convention",
 *      title: "Treaty"
 *      selected: ["basel"]
 * }
 */
$.fn.brsODataUIBuilder = function(filters) {
    var result = '<div id="brs-filters">';
    
    var odata = new BrsOData('http://informea.pops.int/BrsDocuments/MFiles.svc/');

    
    var filterTmpl = kendo.template(
            '<div class="brs-filter brs-terms-container">' + 
            '   #= title#' +  
            '   <select data-brs-filter="#= type#" #= list?"data-brs-list":""#></select>' + 
            '</div>'
    );
    var predefined = {};
    for(var f in filters) {
        var filter = filters[f];
        var show = filter.show === undefined || filter.show == true; 
        if (show) {
            result += filterTmpl($.extend({list: false}, filter));
        }
        predefined[filter.type] = filter.selected || [];
    }
    result += "</div>";

    result += "   <div>" +
        "            <div class=\"brs-filter brs-terms-container\">" +
        "                <table>" +
        "                    <thead>" +
        "                        <tr>" +
        "                            <!--<th>UNnumber</th>-->" +
        "                            <th>Treaty</th>" +
        "                            <th>Party</th>" +
        "                            <th>Publication Date</th>" +
        "                            <th>&nbsp;</th>" +
        "                        </tr>" +
        "                    </thead>" +
        "                    <tbody data-brs-documents>" +
        "                    </tbody>" +
        "                </table>" +
        "            </div>" +
        "            <div class=\"brs-documents-pager\"></div>" +
        "        </div>";
    var rowTemplate = "        <tr>" +
        "            <td>#= Convention#</td>" +
        "            <td>#= CountryFull != null? CountryFull: \"\" #</td>" +
        "            <td>#= PublicationDate != null? kendo.toString(kendo.parseDate(PublicationDate), \"y\"): \"\" #</td>" +
        "            <td>" +
        "                 <div class=\"brs-tabstrip\">" +
        "                    <ul>" +
        "                        #   var found = false;" +
        "                            for (var j = 0; j < Titles.length; j++) { #" +
        "                            # for (var i = 0; i < BrsOData.LANGUAGES.length; i++) { #" +
        "                                # if (BrsOData.LANGUAGES[i].id == Titles[j].Language) {#" +
        "                                    <li class=\"brs-tab brs-tab-#: BrsOData.LANGUAGES[i].id#\">  #= BrsOData.LANGUAGES[i].value #</li>" +
        "                                # found = true; break; # " +
        "                                #}#   " +
        "                            # } #" +
        "                            # if (!found){#" +
        "                                <li class=\"brs-tab brs-tab-#: Titles[j]#\">  #= Titles[j].LanguageFull #</li>" +
        "                            # } #" +
        "                        # } #" +
        "                    </ul>" +
        "                    # for (var j = 0; j < Titles.length; j++) { #" +
        "                            # for (var i = 0; i < BrsOData.LANGUAGES.length; i++) { #" +
        "                                # found = false; #" +
        "                                # if (BrsOData.LANGUAGES[i].id == Titles[j].Language) {#" +
        "                                    <div>" +
        "                                        <div class=\"brs-tab-content brs-tab-title\">#: Titles[j].Value #</div>" +
        "                                        <!--<div class=\"brs-tab-content brs-tab-unnumber\">#: UnNumber #</div>-->" +
        "                                        <div class=\"brs-tab-content brs-tab-description\">#: Descriptions[j].Value #</div>" +
        "                                        <div class=\"brs-tab-content brs-tab-files\">" +
        "                                            # for (var l = 0; l < Files.length; l++) { # " +
        "                                                    # if (Files[l].Language == Titles[j].Language) {#" +
        "                                                        <span class=\"brs-tab-files-link\">" +
        "                                                            <a href=\"#:Files[l].Url#\">#:Files[l].Extension#</a>" +
        "                                                        </span>" +
        "                                                    #}#" +
        "                                            " +
        "                                            # } #" +
        "                                        </div>" +
        "                                    </div>" +
        "                                    # found = true; break; #" +
        "                                # } #   " +
        "                            # } #" +
        "                    # } #" +
        "                </div>" +
        "            </td>" +
        "        </tr>";
    $(this).html(result);
    $(this).brsODataUI({service: odata, predefined: predefined, template: rowTemplate});
};



// @codekit-prepend "brs-odata.js";
// @codekit-prepend "brs-ui.js";
// @codekit-prepend "brs-ui-builder.js";

