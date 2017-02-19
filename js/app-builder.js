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

 var filters_nip = [
    {
      type: "convention",
      title: "Treaty",
      selected: ["stockholm", "rotterdam"]
    },
    {
       type: "type",
       title: "Document type",
       selected: ["32e4bf01-45e6-4c2c-be77-53e6a7e4dbdf", "0ed4d124-6567-4386-9b70-1446e99b7f77"],
       list: true
    },
    {
       type: "programme",
       title: "Programme",
       selected: ["f893e74d-64d0-e311-bf02-0050569d5de3"],
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

//$("#brs-builder-leg").brsODataUIBuilder(filters_leg);
$("#brs-builder-nip").brsODataUIBuilder(filters_nip);


});

