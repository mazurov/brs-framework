$(document).ready(function() {
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
       title: "Country",
    },
    {
       type: "empty-country",
       title: "Show records without country?",
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
$("#brs-builder").brsODataUIBuilder(filters_all);


});

