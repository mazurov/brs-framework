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
    type: [],
    country: [],
    showEmptyCountry: true
  };

  filters = jQuery.extend(filters, predefined);

  var docRequestOptions = {
    filters: filters,
    page: 1,
    pageSize: options.pageSize || 10,
    sort: { field: "PublicationDate", dir: "desc"}
  };

  service.listsDataSources().then(_processLists);
  _processConventions(service.conventionsDataSource());
  _processLanguages(service.languagesDataSource());
  _processYears(service.yearsDataSource(2005));
  _processCountries(service.countriesDataSource());

  _processDocuments(service.documentsDataSource(docRequestOptions));
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
    var ds = service.documentsDataSource(docRequestOptions);
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
          {
            dataSource: ds,
            dataTextField: "name",
            dataValueField: "id",
            change: _onFiltersChange});
    });
  }

  function _processYears(ds) {
    $("select[data-brs-filter='year']", self.parentEl).each(function(index, el) {
      $(el).kendoMultiSelect(
          {dataSource: ds, dataTextField: "value", dataValueField: "value", change: _onFiltersChange});
    });
  }

  function _processCountries(ds) {
    $("select[data-brs-filter='country']", self.parentEl).each(function(index, el) {
      $(el).kendoMultiSelect(
          {dataSource: ds, dataTextField: "value", dataValueField: "id", change: _onFiltersChange});
    });
  }

  function _processDocuments(ds) {
    $("tbody[data-brs-documents]", self.parentEl).each(function(index, el) {
      var tmpl = template || kendo.template($("#brs-template").html());
      var pager = $(".brs-documents-pager");

      // Destroy all previous event handlers
      kendo.destroy($(el));
      kendo.destroy($(pager));

      $(el).kendoListView({
        dataSource: ds,
        template: tmpl,
        autoBind: true,
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
               $(".brs-tab-description", this).kendoPanelBar(
                {
                  animation: {
                        // fade-out closing items over 1000 milliseconds
                        collapse: {
                            duration: 1000,
                            effects: "fadeOut"
                        },
                      // fade-in and expand opening items over 500 milliseconds
                      expand: {
                          duration: 500,
                          effects: "expandVertical fadeIn"
                      }
                  }
                }
               );
               $(this).kendoTabStrip().data("kendoTabStrip").activateTab(tab);
            }
          );
        
        },
      });
      pager.kendoPager({
         dataSource: ds,
      });
    });
  }

  // --------------------------------------------------------------------------
};