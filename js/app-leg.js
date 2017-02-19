$(document).ready(function() {
 var filters_leg = [
    {
      type: "convention",
      title: "Treaty",
      selected: ["basel"]
    },
    {
       type: "type",
       title: "Document type",
       selected: ["f8a0453d-86e5-e311-86cc-0050569d5de3"],
       list: true
    },
    {
       type: "programme",
       title: "Programme",
       selected: ["277ffdca-7b64-4516-a888-cc4027b19a40"],
       list: true
    },
    {
       type: "year",
       title: "Year"
    },
    {
       type: "language",
       title: "Language"
    },
    {
       type: "term",
       title: "Terms",
       list: true
    }

 ];

$("#brs-builder-leg").brsODataUIBuilder(filters_leg);

});
