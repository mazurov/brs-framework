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
                            #  var found;# 
                            #  for (var j = 0; j < Titles.length; j++) { #
                            #      found = false; # 
                            #      for (var i = 0; i < BrsOData.LANGUAGES.length; i++) { #
                            #        if (BrsOData.LANGUAGES[i].id == Titles[j].Language) { #
                                        <li class="brs-tab brs-tab-#: BrsOData.LANGUAGES[i].id#">  #= BrsOData.LANGUAGES[i].value #</li>
                            #          found=true; break; # 
                            #        } #   
                            #      } #
                            #      if (!found){#
                                        <li class="brs-tab brs-tab-#: Titles[j].Language#">  #= Titles[j].LanguageFull #</li>
                            #      } #
                            #  } #
                    </ul>
                    # for (var j = 0; j < Titles.length; j++) { #
                            # for (var i = 0; i < BrsOData.LANGUAGES.length; i++) { #
                                # found = false; #
                                # if (BrsOData.LANGUAGES[i].id == Titles[j].Language) {#
                                    <div>
                                        <div class="brs-tab-content brs-tab-title">#= Titles[j].Value #</div>
                                        <!--<div class="brs-tab-content brs-tab-unnumber">#: UnNumber #</div>-->
                                        <div class="brs-tab-content brs-tab-description">#= Descriptions[j].Value #</div>
                                        <div class="brs-tab-content brs-tab-files">
                                            # for (var l = 0; l < Files.length; l++) { # 
                                                    #   if (Files[l].Size == 0 ) {#
                                                        #      if (Files[l].Extension == 'txt') {#
                                                            <div class="brs-tab-content brs-tab-notyet">Not yet implemented</div>
                                                        #      }#
                                                    #   } else {#    
                                                        #   if (Files[l].Language == Titles[j].Language) {#
                                                        <span class="brs-tab-files-link">
                                                            <a href="#:Files[l].Url#">#:Files[l].Extension#</a>
                                                        </span>
                                                    #}}#
                                            
                                            # } #
                                        </div>
                                    </div>
                                    # found = true; break; #
                                # } #   
                            # } #
                    # } #
                </div>
            </td>
        </tr>`;
    // console.debug(rowTemplate);
    $(this).html(result);
    $(this).brsODataUI({service: odata, predefined: predefined, template: rowTemplate});
};

