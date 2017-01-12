var BrsOData = function(url, done, fail) {
  this.url = url;
  this.fail = fail || function() {};
  this.done = done || function() {};
};



BrsOData.prototype.loadValuesByType = function(type) {
  return $.getJSON(this.url + "/Values?$callback=?", {
                     "$filter": "Types/any(x: x/ListPropertyTypeId eq guid'" +
                         type.ListPropertyTypeId + "')",
                     "$orderby": "Value",
                     "$format": "json",
                   }).done(function(data, status, jqXHR) {
    data.type = type.Name;
    return;
  }).fail(this.fail);
};

BrsOData.prototype.loadValuesByTypes = function(data, textStatus, jqXHR) {
  var promises = [];
  var self = this;

  _.each(data.value,
         function(type) { promises.push(self.loadValuesByType(type)); });
  var last = $.when.apply($, promises).then(function() {
    var results = [];
    _.each(arguments, function(result) { results.push(result[0]); });
    return $.Deferred().resolve(results);
  }, this.fail);

  last.done(this.done);
};


/*  1. Load types
 *  2. Load values by type
 *
 *  "fail" callback is not executed in cross domain requests, including jsonp
 */
BrsOData.prototype.load = function() {
  jQuery.getJSON(this.url + "ValueTypes?$callback=?",
                 {"$orderby": "Name", "$format": "json"})
      .done(this.loadValuesByTypes.bind(this))
      .fail(this.fail);

};

/*
 * attributes: {"name":string, op: "eq" || "contains", "quote": bool, "value":
 * any}
 * links:  {"name":string, op: "eq" || "contains", "id": guid}
 */
BrsOData.prototype.findDocuments = function(attributes, links, done) {
  var filter = "";
  var delim = "";
  _.each(attributes, function(attr) {
    var quote = attr.quote ? "'" : "";
    filter += delim + " " + attr.name + " " + attr.op + " " + quote +
              attr.value + quote;
    delim = " and ";
  });
  _.each(links, function(link) {
    filter += delim + " " + link.name + "/any(x: x/ListPropertyId  " + link.op +
              " guid'" + link.id + "')";
    delim = " and ";
  });

  jQuery.getJSON(this.url + "Documents?$callback=?", {
                   "$filter": filter,
                   "$orderby": "PublicationDate desc",
                   "$format": "json"
                 })
      .done(done)
      .fail(this.fail);
};
