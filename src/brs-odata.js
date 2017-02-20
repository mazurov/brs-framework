var BrsOData = function(url, urlProfiles, done, fail) {
  this.url = url;
  this.urlProfiles = urlProfiles;

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

BrsOData.prototype.getDataSource = function(baseUrl, entryUrl, data, fields, sort) {
  return new kendo.data.DataSource({
    type: "odata",
    transport: {
                 read: {
                   url: baseUrl + "/" + entryUrl + "/",
                   dataType: "jsonp",
                   data: $.extend({$inlinecount: "allpages"}, data)
                 }
               },
    sort: sort,
    serverPaging: true,
    serverSorting: true,
    schema: {
      data: function(data) { 
        return data.value? data.value: data.d.results; },
      total: function(data) { return data["odata.count"]?data["odata.count"]:data.d["__count"]; },
      serverPaging: true,
      model: {fields: fields}
    }
  });
};



BrsOData.prototype.listTypesDataSource = function() {
  return this.getDataSource(this.url, "ValueTypes", undefined,
                            {id: "ListPropertyTypeId", value: "Name"});
};

BrsOData.prototype.countriesDataSource = function() {
  return this.getDataSource(this.urlProfiles, "countryNames", undefined,
                            {id: "IsoCode2d", value: "NameEn"}, {field: "NameEn"});
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
              var ds = self.getDataSource(self.url,
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
          case 'country':
            andFilter.push('(' + this._odataOr('Country', values) + ')');
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
  return this.getDataSource(this.url, "Documents", {"$expand": "Titles,Descriptions,Files", "$filter": filter});
};
