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
      model:{
        fields: fields
      }
    }
  });
};

BrsOData.prototype.CONVENTIONS = [
  {
    name: "basel"
  },
  {
    name: "rotterdam"
  },
  {
    name: "stockholm"
  }
];


BrsOData.prototype.listTypesDataSource = function() {
  return this.getDataSource("ValueTypes", undefined, { id: "ListPropertyTypeId", value: "Name"});
};

BrsOData.prototype.conventionsDataSource = function() {
  return new kendo.data.DataSource({
    type: "json",
    data: this.CONVENTIONS,
    sort: {field: "value", dir: "asc"},
    schema: {
       model: {
        fields:{
          value: "name"
        }
       }
    }
  });
};

BrsOData.prototype.listsDataSources = function() {
  var ds = this.listTypesDataSource();
  var self = this;
  return ds.read().then(
    // ------------------------------------------------------------------------
    function() {
      var result = [];
      _.each(ds.view(),
      // ----------------------------------------------------------------------
      function(view){
        var ds = self.getDataSource("Values", 
          {
            $filter: "Types/any(x: x/ListPropertyTypeId eq guid'" + view.id + "')"
          },
          {
            id: "ListPropertyId",
            value: "Value"
          },
          {field: "value", dir:"asc"}
        );
        result.push({type: view.value, data: ds});
      });
      return result;
      // ----------------------------------------------------------------------
  });
    // ------------------------------------------------------------------------
};

BrsOData.prototype.documentsDataSource = function(conventions){
  return this.getDataSource("Documents", {"$expand": "Titles,Files"});
};


// BrsOData.prototype.loadValuesByType = function(type) {
//   return $.getJSON(this.url + "/Values?$callback=?", {
//                      "$filter": "Types/any(x: x/ListPropertyTypeId eq guid'"
//                      +
//                          type.ListPropertyTypeId + "')",
//                      "$orderby": "Value",
//                      "$format": "json",
//                    }).done(function(data, status, jqXHR) {
//     data.type = type.Name;
//     return;
//   }).fail(this.fail);
// };

// BrsOData.prototype.loadValuesByTypes = function(data, textStatus, jqXHR) {
//   var promises = [];
//   var self = this;

//   _.each(data.value,
//          function(type) { promises.push(self.loadValuesByType(type)); });
//   var last = $.when.apply($, promises).then(function() {
//     var results = [];
//     _.each(arguments, function(result) { results.push(result[0]); });
//     return $.Deferred().resolve(results);
//   }, this.fail);

//   last.done(this.done);
// };


// /*  1. Load types
//  *  2. Load values by type
//  *
//  *  "fail" callback is not executed in cross domain requests, including jsonp
//  */
// BrsOData.prototype.load = function() {
//   jQuery.getJSON(this.url + "ValueTypes?$callback=?",
//                  {"$orderby": "Name", "$format": "json"})
//       .done(this.loadValuesByTypes.bind(this))
//       .fail(this.fail);

// };

// /*
//  * attributes: {"name":string, op: "eq" || "contains", "quote": bool,
//  "value":
//  * any}
//  * links:  {"name":string, op: "eq" || "contains", "id": guid}
//  */
// BrsOData.prototype.findDocuments = function(attributes, links, done) {
//   var filter = "";
//   var delim = "";
//   _.each(attributes, function(attr) {
//     var quote = attr.quote ? "'" : "";
//     filter += delim + " " + attr.name + " " + attr.op + " " + quote +
//               attr.value + quote;
//     delim = " and ";
//   });
//   _.each(links, function(link) {
//     filter += delim + " " + link.name + "/any(x: x/ListPropertyId  " +
//     link.op +
//               " guid'" + link.id + "')";
//     delim = " and ";
//   });

//   jQuery.getJSON(this.url + "Documents?$callback=?", {
//                    "$filter": filter,
//                    "$orderby": "PublicationDate desc",
//                    "$format": "json"
//                  })
//       .done(done)
//       .fail(this.fail);
// };
