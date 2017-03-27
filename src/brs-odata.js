var BrsOData = function(url, urlProfiles, done, fail) {
  this.url = url;
  this.urlProfiles = urlProfiles;

  this.fail = fail || function() {};
  this.done = done || function() {};
};

BrsOData.CONVENTIONS = [{name: "basel"}, {name: "rotterdam"}, {name: "stockholm"}];

BrsOData.LANGUAGES = window.languages.getAllLanguageCode().map(function(langcode){
  var info = window.languages.getLanguageInfo(langcode);
  return {
      id: langcode,
      name: info.name,
      value: info.nativeName,
      inbrs: info.inbrs,
      inun: info.inun,
      group: info.inun?"UN languages":"Other"
  };
});

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



BrsOData.prototype.getDataSource = function(options) {
  return new kendo.data.DataSource({
    type: "odata",
    transport: {
                 read: {
                   url: options.baseUrl + "/" + options.entryUrl + "/",
                   dataType: "jsonp",
                   data: $.extend({$inlinecount: "allpages"}, options.data)
                 }
               },
    sort: options.sort,
    serverPaging: true,
    serverSorting: true,
    page: options.page,
    pageSize: options.pageSize,
    schema: {
      data: function(data) { 
        var handler = options.handler || function(data) { return data; };
        return handler(data.value? data.value: data.d.results); 
      },
      total: function(data) { return data["odata.count"]?data["odata.count"]:data.d["__count"]; },
      serverPaging: true,
      model: {fields: options.fields}
    }
  });
};



BrsOData.prototype.listTypesDataSource = function() {
  return this.getDataSource(
      { baseUrl: this.url,
        entryUrl:"ValueTypes",
        fields: {id: "ListPropertyTypeId", value: "Name"}
      });
};

BrsOData.prototype.countriesDataSource = function() {
  return this.getDataSource(
    { baseUrl: this.urlProfiles,
      entryUrl: "countryNames",
      fields: {id: "IsoCode2d", value: "NameEn"},
      sort: {field: "NameEn"}
    }
  );
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
  var langs = $.merge([], _.filter(BrsOData.LANGUAGES, function(lang){
    return lang.inbrs;}));
  langs.sort(window.languages.sort);
  return new kendo.data.DataSource({
    type: "json",
    data: langs,
    group: {field: "group", dir: "desc"}
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
                { baseUrl: self.url,
                  entryUrl: "Values",
                  data: {
                    $filter: "Types/any(x: x/ListPropertyTypeId eq guid'" +
                                 view.id + "')"
                  },
                  fields: {id: "ListPropertyId", value: "Value"},
                  sort: {field: "value", dir: "asc"}});
              result.push({type: view.value, data: ds});
            });
        return result;
        // ----------------------------------------------------------------------
      });
  // ------------------------------------------------------------------------
};
BrsOData.prototype._odataOr = function(field, values, op) {
  var exp = [];
  var quote = "'";
  op = op || 'eq';

  for(var i in values){
    if(values[i] === 'null' || typeof values[i] == 'number'){
	    quote = "";
    }
    exp.push(field + " " + op + " " + quote + values[i] + quote);
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
BrsOData.prototype.documentsDataSource = function(options) {
  var andFilter = [];
  var filter = '';
  var filters = options.filters;

  if (filters){
    for(var type in filters) {
      var values = filters[type];
      // TODO: refactor check
      if (typeof values === 'boolean' || values.length > 0) {
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
          case 'showEmptyCountry':
            if (values) {
              andFilter.push('(' + this._odataOr('Country', ['null'], 'ne') + ')');
            }
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

  return this.getDataSource(
    {
      baseUrl: this.url, 
      entryUrl: "Documents",
      data: {"$expand": "Titles,Descriptions,Files", "$filter": filter},
      page: options.page,
      pageSize: options.pageSize,
      sort: options.sort,
      handler: (data) => { // Group Titles, Descriptions, and Files by Language
        for (var row of data) {
          let languages = [];
          for (var title of row.Titles){
            let record  = {};
            let languageInfo = window.languages.getLanguageInfo(title.Language);
            record.Language = title.Language;
            record.LanguageFull = title.LanguageFull;
            record.LanguageNative = languageInfo !== null? languageInfo.nativeName: record.LanguageFull;
            record.LanguageIsUN = languageInfo !== null? languageInfo.inun: false;
            record.Title = title.Value;
            record.Description =  row.Descriptions.filter((item) => item.Language == record.Language)[0].Value;
            record.Files = row.Files.filter((item) => item.Language == record.Language);
            languages.push(record);
          }
          languages.sort((a,b) => 
              { 
                if (!a.LanguageIsUN && !b.LanguageIsUN){
                  return a.LanguageFull.localeCompare(b.LanguageFull);
                }

                if (a.LanguageIsUN && !b.LanguageIsUN) return -1;
                if (!a.LanguageIsUN && b.LanguageIsUN) return 1;
                
                return a.LanguageFull.localeCompare(b.LanguageFull);

              }
            );
          row.Languages = languages;
        }
        return data;
      }
    });
};
