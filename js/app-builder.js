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
      selected: ["stockholm", "rotterdam"],
      show: false
    },
    {
       type: "type",
       title: "Document type",
       selected: ["32e4bf01-45e6-4c2c-be77-53e6a7e4dbdf", "0ed4d124-6567-4386-9b70-1446e99b7f77"],
       list: true,
       show: false
    },
    {
       type: "programme",
       title: "Programme",
       selected: ["5f8c232a-31dd-4be9-91b7-3d92b2c59fe0"],
       list: true,
       show: false
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
       type: "country",
       title: "Country"
    }
 ];

  var filters_all = [
    {
      type: "convention",
      title: "Treaty",
      selected: []
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
       type: "country",
       title: "Country"
    },
    {
       type: "type",
       title: "Document type",
       selected: [],
       list: true,
    },
    {
       type: "programme",
       title: "Programme",
       selected: [],
       list: true,
    },
    {
       type: "term",
       title: "Terms",
       selected: [],
       list: true,
    },
    {
       type: "meetingtype",
       title: "Meetings types",
       selected: [],
       list: true,
    },
    {
       type: "meeting",
       title: "Meetings",
       selected: [],
       list: true,
    },
    {
       type: "chemical",
       title: "Chemicals",
       selected: [],
       list: true,
    }
 ];


//$("#brs-builder-leg").brsODataUIBuilder(filters_leg);
$("#brs-builder-nip").brsODataUIBuilder(filters_all);


});

