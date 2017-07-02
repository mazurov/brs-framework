$(document).ready(function() {
 var filters_leg = [
    {
      type: "convention",
      title: "Treaty",
      selected: ["basel"],
      show: false
    },
    {
       type: "type",
       title: "Document type",
       selected: ["f8a0453d-86e5-e311-86cc-0050569d5de3"],
       list: true,
       show: false
    },
    {
       type: "programme",
       title: "Programme",
       selected: ["e293e74d-64d0-e311-bf02-0050569d5de3"],
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

$("#brs-builder-leg").brsODataUIBuilder({filters: filters_leg});

});

