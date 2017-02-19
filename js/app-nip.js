$(document).ready(function() {

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
       selected: ["5f8c232a-31dd-4be9-91b7-3d92b2c59fe0"],
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

$("#brs-builder-nip").brsODataUIBuilder(filters_nip);


});

