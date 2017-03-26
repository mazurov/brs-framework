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
    
    var odata = new BrsOData('http://informea.pops.int/BrsDocuments/MFiles.svc/',
        'http://informea.pops.int/CountryProfiles/bcTreatyProfile.svc');

    
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

    result += `<div>
                <div class="brs-documents">
                    <table>
                        <thead>
                            <tr>
                                <!--<th>UNnumber</th>-->
                                <th>Treaty</th>
                                <th>Country</th>
                                <th>Publication Date</th>
                                <th>&nbsp;</th>
                            </tr>
                        </thead>
                        <tbody data-brs-documents>
                        </tbody>
                    </table>
                </div>
                <div class="brs-documents-pager"></div>
        </div>`;
    
    
    var rowTemplate = `<tr>
            <td>#= Convention#</td>
            <td>#= CountryFull != null? CountryFull: "" #</td>
            <td>#= PublicationDate != null? kendo.toString(kendo.parseDate(PublicationDate), "y"): "" #</td>
            <td>
                    <div class="brs-tabstrip">
                    <ul>
                            #  for (var j = 0; j < Languages.length; j++) { #
                                <li class="brs-tab brs-tab-#: Languages[j].Language#">  #= Languages[j].LanguageNative #</li>
                            #  } #
                    </ul>
                    # for (var j = 0; j < Languages.length; j++) { #
                        <div>
                            <div class="brs-tab-content brs-tab-title">#= Languages[j].Title #</div>
                            <!--<div class="brs-tab-content brs-tab-unnumber">#: UnNumber #</div>-->
                            
                            # if (Languages[j].Description){ # 
                                <ul class="brs-tab-content brs-tab-description">
                                    <li>Description
                                    <ul>
                                        <li>#= Languages[j].Description #</li>
                                    </ul>
                                </ul>
                            # } #
                           
                            <div class="brs-tab-content brs-tab-files">
                                # for (var l = 0; l < Languages[j].Files.length; l++) { # 
                                        #   if (Languages[j].Files[l].Size == 0 ) {#
                                            # if (Languages[j].Files[l].Extension == 'txt') {#
                                                <div class="brs-tab-content brs-tab-notyet">Not yet implemented</div>
                                            #}#
                                        #   } else {#    
                                            <span class="brs-tab-files-link">
                                                <a href="#:Languages[j].Files[l].Url#">#:Languages[j].Files[l].Extension#</a>
                                            </span>
                                        #}#
                                
                                # } #
                            </div>
                        </div>
                    # } #
                </div>
            </td>
        </tr>`;
    // console.debug(rowTemplate);
    $(this).html(result);
    $(this).brsODataUI({service: odata, predefined: predefined, template: rowTemplate});
};

