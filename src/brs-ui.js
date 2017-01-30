var BrsODataUI = function(service) {
    this.service = service;
};

BrsODataUI.prototype.init = function() {
  this.service.listsDataSources().then(_processLists);
  _processConventions(this.service.conventionsDataSource());
  _processDocuments(this.service.documentsDataSource());

  // --------------------------------------------------------------------------
  function _processLists(dss){
    $("select[data-brs-filter]").each(function(index, el){
        var type = $(el).data("brs-filter");
        var ds = _.find(dss, function(o){return o.type == type;}).data;

        $(el).kendoMultiSelect(
            {
                dataSource: ds,
                dataTextField: "value",
                dataValueField: "id"
            }
        );    
    });
  }

  function _processConventions(ds){
       $("select[data-brs-convention]").each(function(index, el){
        $(el).kendoMultiSelect(
            {
                dataSource: ds,
                dataTextField: "value",
                dataValueField: "value"
            }
        );    
    });
  }

  function _processDocuments(ds){
       $("table[data-brs-documents]").each(function(index, el){
        var tmpl = $("#" + $(el).data("brs-documents"));
        $(el).kendoListView(
            {
                dataSource: ds,
                template: tmpl.html()
            }
        );    
    });
  }

  // --------------------------------------------------------------------------
};