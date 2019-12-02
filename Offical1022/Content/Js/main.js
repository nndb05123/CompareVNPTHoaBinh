//------------------------------------------------------------
// Helper Functions 
//------------------------------------------------------------
// Format the output so it has the appropriate delimiters
const TABLE_EXPORT_ROW_DELIMITER = String.fromCharCode(0);
const TABLE_EXPORT_COL_DELIMITER = String.fromCharCode(11);
const TABLE_EXPORT_COL_DELIMITER_2 = '","';
const TABLE_EXPORT_ROW_DELIMITER_2 = '"\r\n"';

function formatRows(rows) {
    return rows.get().join(TABLE_EXPORT_ROW_DELIMITER)
        .split(TABLE_EXPORT_ROW_DELIMITER).join(TABLE_EXPORT_ROW_DELIMITER_2)
        .split(TABLE_EXPORT_COL_DELIMITER).join(TABLE_EXPORT_COL_DELIMITER_2);
}
// Grab and format a row from the table
function grabRow(i, row) {

    var $row = $(row);
    //for some reason $cols = $row.find('td') || $row.find('th') won't work...
    var $cols = $row.find('td');
    if (!$cols.length) $cols = $row.find('th');

    return $cols.map(grabCol)
        .get().join(TABLE_EXPORT_COL_DELIMITER);
}
// Grab and format a column from the table 
function grabCol(j, col) {
    var $col = $(col),
        $text = $col.text().trim();

    return $text.replace('"', '""'); // escape double quotes

}

function exportTable_CSVDataURI($table) {
    var $headers = $table.find('tr:has(th)'),
        $rows = $table.find('tr:has(td)');

    // Grab text from table into CSV formatted string
    var csv = '"';
    csv += formatRows($headers.map(grabRow));
    csv += TABLE_EXPORT_ROW_DELIMITER_2;
    csv += formatRows($rows.map(grabRow)) + '"';

    // Data URI
    return 'data:application/csv;charset=utf-8,%EF%BB%BF' + encodeURIComponent(csv);
}

function exportTableToCSV($table, filename) {
    var $headers = $table.find('tr:has(th)'),
        $rows = $table.find('tr:has(td)')
        , tmpColDelim = String.fromCharCode(11)
        , tmpRowDelim = String.fromCharCode(0)
        , colDelim = '","', rowDelim = '"\r\n"';

    // Grab text from table into CSV formatted string
    var csv = '"';
    csv += formatRows($headers.map(grabRow));
    csv += rowDelim;
    csv += formatRows($rows.map(grabRow)) + '"';

    // Data URI
    var csvData = 'data:application/csv;charset=utf-8,%EF%BB%BF' + encodeURIComponent(csv);

    // For IE (tested 10+)
    if (window.navigator.msSaveOrOpenBlob) {
        var blob = new Blob([decodeURIComponent(encodeURI(csv))], {
            type: "text/csv;charset=utf-8;"
        });
        navigator.msSaveBlob(blob, filename);
    } else {
        var temp = document.createElement('a');
        temp.href = csvData;
        temp.download = filename;
        temp.click();
    }

    //------------------------------------------------------------
    // Helper Functions 
    //------------------------------------------------------------
    // Format the output so it has the appropriate delimiters

    function formatRows(rows) {
        return rows.get().join(tmpRowDelim)
            .split(tmpRowDelim).join(rowDelim)
            .split(tmpColDelim).join(colDelim);
    }
    // Grab and format a row from the table
    function grabRow(i, row) {

        var $row = $(row);
        //for some reason $cols = $row.find('td') || $row.find('th') won't work...
        var $cols = $row.find('td');
        if (!$cols.length) $cols = $row.find('th');

        return $cols.map(grabCol)
            .get().join(tmpColDelim);
    }
    // Grab and format a column from the table 
    function grabCol(j, col) {
        var $col = $(col),
            $text = $col.text().trim();

        return $text.replace('"', '""'); // escape double quotes

    }
}