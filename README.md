# brs-framework
JavaScript library for accessing and displaying information from the
[BRS M-Files service](http://informea.pops.int/BrsDocuments/MFiles.svc).

Consists of two components:

1. [Read data](https://github.com/mazurov/brs-framework/blob/master/src/brs-odata.js) from BRS's [documents service](http://informea.pops.int/BrsDocuments/MFiles.svc)
2. [UI components](https://github.com/mazurov/brs-framework/blob/master/src/brs-ui.js)  for filter and displaying documents. Based on the [Kendo UI library](http://www.telerik.com/kendo-ui).


# Development
- *src*: common library to handle M-Files and UI for it
- *js*:
    - *app-leg.js*: main scripts for legislation frontend
    - *app-nip.js*: main scripts for NIP frontend

## Run in development
- `gulp`: will open browser at http://localhost:3000 with live reload

You can test only one of the apps: legislation or nip. For selecting library you need to uncomment the selected apps script in `/index.html`:

Here we test only legislation app:
```html
    <script src="js/app-leg.js" type="text/javascript"></script>
    <!-- <script src="js/app-nip.js" type="text/javascript"></script> -->
```

# Deployment

- Copy the files `brs.js` and files which starts with `app-*.js` to the web server
- Include the `brs.js` and the selected `app` script to your page where you would like to display the frontend
- Add empty div with id corresponds to the selected app:
```
    <div id="brs-builder-leg"></div>
    or
    <div id="brs-builder-nip"></div
```

