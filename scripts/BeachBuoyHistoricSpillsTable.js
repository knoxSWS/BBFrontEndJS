function create_historicspills_table(parentNode, data, head, body, foot) {
    if (typeof head == "undefined") { head = true; }
    if (typeof body == "undefined") { body = true; }
    if (typeof foot == "undefined") { foot = true; }
    const displaycol = ["eventId", "siteUnitNumber", "bathingSite", "outfallName", "eventStart", "eventStop", "duration", "activity"];
    var spilltable = document.getElementById("beachbuoy_tbl_historicspill");
    if (spilltable != null) { spilltable.outerHTML = ''; }
    var table = document.createElement("table");
    table.setAttribute("id", "beachbuoy_tbl_historicspill");
    table.setAttribute("class", "beachbuoy_table-markers-data-show");
    table.setAttribute("width", "100%");
    var tr, th, td;

    // header
    tr = document.createElement("tr");
    tr.setAttribute("class", "beachbuoy_information-panel-today");
    var headers = data.head || [];
    for (var headCount = 0; headCount < headers.length; headCount++) {
        th = document.createElement("th");
        th.setAttribute("class", "beachbouy_th-HistoricSpillDataHeader-style");

        th.innerHTML = headers[headCount];
        tr.appendChild(th);
    }
    if (head) {
        var thead = document.createElement("thead");
        thead.appendChild(tr);
        table.appendChild(thead);
    } else {
        table.appendChild(tr);
    }
    // end header

    // body
    var table_body = data.body || [];
    if (body) {
        //console.log(body);
        var tbody = document.createElement("tbody");
    }
    for (var rowCount = 0; rowCount < table_body.length; rowCount++) {
        tr = document.createElement("tr");
        tr.setAttribute("class", "beachbuoy_row-style beachbuoy_td-bg-color-blue");
        for (var columnCount = 0; columnCount < displaycol.length; columnCount++) {
            td = document.createElement("td");
            if (displaycol[columnCount] === "eventStart" || displaycol[columnCount] === "eventStop") {
                td.innerHTML = moment(table_body[rowCount][displaycol[columnCount]]).tz(TIMEZONE).format('DD/MM/YYYY HH:mm A');
            }
            else if (displaycol[columnCount] === "duration") {
                var calculatedDuration = table_body[rowCount][displaycol[columnCount]];
                if (Math.floor(calculatedDuration / 60) === calculatedDuration / 60) {
                    td.innerHTML = (calculatedDuration / 60);
                }
                else {
                    td.innerHTML = (calculatedDuration / 60).toFixed(2);
                }
            }
            else {
                td.innerHTML = table_body[rowCount][displaycol[columnCount]];
            }
            tr.appendChild(td);
        }
        if (body) {
            tbody.appendChild(tr);
        } else {
            table.appendChild(tr);
        }
    }
    if (body) {
        table.appendChild(tbody);
    }
    
    if (table_body.length === 0) {
        trBlank = document.createElement("tr");
        trBlank.setAttribute("class", "beachbuoy_row-style-blank");
        tdBlank = document.createElement("td");
        tdBlank.setAttribute("colspan", 8);
        tdBlank.innerHTML = "No records found";
        trBlank.appendChild(tdBlank);
        tbody.appendChild(trBlank);
        table.appendChild(tbody);
    }
    // end body

    // footer
    if (foot) {
        var tfoot = document.createElement("tfoot");
        tr = document.createElement("tr");
        var footer = data.foot || [];
        for (var footCount = 0; footCount < footer.length; footCount++) {
            th = document.createElement("th");
            th.innerHTML = footer[footCount];
            tr.appendChild(th);
        }
        tfoot.appendChild(tr);
        table.appendChild(tfoot);
    }
    // end footer

    if (parentNode) {
        parentNode.appendChild(table);
    }
    //return table;
}