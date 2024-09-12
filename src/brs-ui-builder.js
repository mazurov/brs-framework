/**
 * filters: [Object,...]
 *  Object: {
 *      type: "convention",
 *      title: "Treaty"
 *      selected: ["basel"]
 * }
 */
$.fn.brsODataUIBuilder = function(options) {
    var defaults = {
        filters: [],
        showDescriptions: true
    };

    var actual = $.extend({}, defaults, options || {});

    var filters = actual['filters'];
    var result = '<div id="brs-filters">';
    
    var odata = new BrsOData('https://informea.pops.int/BrsDocuments/MFiles.svc/',
        'https://informea.pops.int/CountryProfiles/bcTreatyProfile.svc');

    
    var filterTmpl = kendo.template(
            '<div class="brs-filter brs-terms-container">' + 
            '   #= title#' +  
            '   <select data-brs-filter="#= type#" #= list?"data-brs-list":""#></select>' + 
            '</div>'
    );
    var predefined = {};
    for(var f in filters) {
        var filter = filters[f];
        var show = filter.show === undefined || filter.show === true;
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
            <td>
                    <div class="brs-rec k-block">
                        <div class="brs-rec-convention">#= ConventionFull#, </div>
                        <div class="brs-rec-country">#= CountryFull != null? CountryFull: "" #, </div>
                        <div class="brs-rec-pubdate">Submission date: #= PublicationDate != null? kendo.toString(kendo.parseDate(PublicationDate), "y"): "" #</div>
                    </div>
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
        `;
   
   if (actual.showDescriptions) {
        rowTemplate += `    # if (Languages[j].Description){ # 
                                <ul class="brs-tab-content brs-tab-description">
                                    <li>Description
                                    <ul>
                                        <li>#= Languages[j].Description #</li>
                                    </ul>
                                </ul>
                            # } #
                  `;
    }

    rowTemplate += `                   
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
    console.log(result);
    $(this).html(result);
    $(this).brsODataUI({service: odata, predefined: predefined, template: rowTemplate});
};

