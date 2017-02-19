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
    $("select[data-brs-filter='convention']", this.parentEl).each(function(index, el){
      console.log("SASHA", $(el));
    });
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
    $("select[data-brs-filter='year']", this.parentEl).each(function(index, el) {
      $(el).kendoMultiSelect(
          {dataSource: ds, dataTextField: "value", dataValueField: "value", change: _onFiltersChange});
    });
  }

  function _processDocuments(ds) {
    ds.pageSize(20);

    $("tbody[data-brs-documents]", this.parentEl).each(function(index, el) {
      var tmpl = kendo.template($("#" + $(el).data("brs-documents")).html());
      var pager = $("#" + $(el).data("brs-documents-pager"));

      $(el).kendoListView({
        dataSource: ds,
        template: tmpl,
        dataBound: function() { 
          $(".brs-tabstrip", this.parentEl).each(
            function() {
               var tab;
               if (self.filters.language.length == 0){
                tab = $("li:first-child");
               }else{
                 for(var i = self.filters.language.length - 1; i >=0; i--){
                    tab =  $(".brs-tab-" +  self.filters.language[i], this);
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